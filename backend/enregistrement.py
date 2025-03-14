from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch, ConnectionError
from datetime import datetime
import time
from flask_cors import CORS
import spacy

app = Flask(__name__)
CORS(app)

# Configuration d'Elasticsearch
ES_HOST = "http://localhost:9200"

# Initialisation de la connexion à Elasticsearch avec tentatives
def connect_elasticsearch(max_attempts=10, delay=5):
    print(f"Tentative de connexion à : {ES_HOST}")
    for attempt in range(max_attempts):
        try:
            es = Elasticsearch(
                [ES_HOST],
                verify_certs=False,
                request_timeout=30,
                max_retries=5,
                retry_on_timeout=True
            )
            if es.ping():
                print(f"Connexion réussie à Elasticsearch après {attempt + 1} tentative(s) !")
                return es
            else:
                print(f"Tentative {attempt + 1}/{max_attempts} : Connexion établie, mais ping échoué.")
        except ConnectionError as e:
            print(f"Tentative {attempt + 1}/{max_attempts} : Erreur de connexion - {e}")
        except Exception as e:
            print(f"Tentative {attempt + 1}/{max_attempts} : Erreur inattendue - {e}")

        if attempt < max_attempts - 1:
            print(f"Attente de {delay} secondes avant la prochaine tentative...")
            time.sleep(delay)
    
    print("Échec de la connexion après toutes les tentatives.")
    return None

# Initialiser l'index Elasticsearch si nécessaire
def init_index(es):
    if es is None:
        print("Impossible d'initialiser l'index : aucune connexion à Elasticsearch.")
        return False
    try:
        if not es.indices.exists(index="transcriptions"):
            es.indices.create(index="transcriptions", body={
                "mappings": {
                    "properties": {
                        "id": {"type": "date"},
                        "timestamp": {"type": "date"},
                        "type_requete": {"type": "text"},
                        "requete": {"type": "text"},
                        "entite_etatique": {"type": "text"}
                    }
                }
            })
            print("Index Elasticsearch initialisé avec succès.")
        return True
    except Exception as e:
        print(f"Erreur lors de l'initialisation de l'index Elasticsearch : {e}")
        return False


nlp = spacy.load("fr_core_news_md")

# Catégories de requêtes

categories = {

    "Fonction Publique": ["fonctionnaire", "concours", "prime", "carriere"],

    "Demande d'information": ["comment", "où", "quand", "prix", "service"],

    "Motion": ["felicitations", "satisfaction", "plainte", "amelioration"],

}

# fonction pour la classification des requetes et des entites etatiques

def classifier_texte(texte):

    doc = nlp(texte.lower())

    for categorie, mots in categories.items():

        if any(mot in doc.text for mot in mots):

            return categorie

    return "Autre"

# Route pour enregistrer une transcription
@app.route('/save_transcription', methods=['POST'])
def save_transcription():
    if es is None:
        return jsonify({'status': 'error', 'message': 'Elasticsearch non disponible.'}), 503
    try:
        data = request.json
        requete = data.get('message', '').strip()

        if not requete:
            return jsonify({'status': 'error', 'message': 'Le champ "requete" ne peut pas être vide.'}), 400

        type_requete = classifier_texte(requete)  # data.get('objet', '')
        entite_etatique = "Fonction Publique" if(type_requete == "Fonction Publique") else data.get('entite_etatique', '')

        doc = {
            "type_requete": type_requete,
            "requete": requete,
            "entite_etatique": entite_etatique,
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        }

        response = es.index(index="transcriptions", document=doc)
        if response['result'] == 'created':
            return jsonify({'status': 'success', 'message': 'Transcription sauvegardée avec succès.'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Erreur lors de la sauvegarde dans Elasticsearch.'}), 500

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Route pour récupérer les transcriptions
@app.route('/get_transcriptions', methods=['GET'])
def get_transcriptions():
    if es is None:
        return jsonify({'status': 'error', 'message': 'Elasticsearch non disponible.'}), 503
    try:
        response = es.search(index="transcriptions", body={
            "query": {"match_all": {}},
            "sort": [{"timestamp": {"order": "desc"}}]
        })

        transcriptions = [
            {
                "id": hit["_id"],
                "date": hit["_source"].get("timestamp", ""),
                "type_requete": hit["_source"].get("type_requete", ""),
                "requete": hit["_source"].get("requete", ""),
                "entite_etatique": hit["_source"].get("entite_etatique", "")  # Ajouté ici
            }
            for hit in response["hits"]["hits"]
        ]

        return jsonify({
            'status': 'success',
            'transcriptions': transcriptions,
            'total': response["hits"]["total"]["value"]
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == "__main__":
    es = connect_elasticsearch(max_attempts=10, delay=5)
    if es is not None:
        if init_index(es):
            app.run(debug=True, port=5000)
        else:
            print("Le serveur ne peut pas démarrer : échec de l'initialisation de l'index.")
    else:
        print("Le serveur ne peut pas démarrer : aucune connexion à Elasticsearch.")