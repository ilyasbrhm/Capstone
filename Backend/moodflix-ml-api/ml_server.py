from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pickle
import logging
import pandas as pd
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

model = None
scaler = None
mlb = None
le = None
df = None
features_scaled = None

def load_models_and_data():
    """Load model, encoders, dan prepare data sesuai dengan inference logic"""
    global model, scaler, mlb, le, df, features_scaled
    
    try:
        # Load model dan encoder
        model = tf.keras.models.load_model("model/sistem_rekomendasi_model.h5")
        
        with open("model/scaler.pkl", "rb") as f:
            scaler = pickle.load(f)
        with open("model/mlb.pkl", "rb") as f:
            mlb = pickle.load(f)
        with open("model/label_encoder.pkl", "rb") as f:
            le = pickle.load(f)
        
        # Load dataset
        df = pd.read_csv("model/dataset_fix.csv")
        
        # Proses ulang genres_list dan genre one-hot encoding (sesuai training)
        df['genres_list'] = df['genres'].apply(lambda x: x.strip("[]").replace("'", "").split(", "))
        genre_df = pd.DataFrame(mlb.transform(df['genres_list']), columns=mlb.classes_)
        
        features = pd.concat([
            df[['release_year', 'popularity', 'rating']].reset_index(drop=True),
            genre_df.reset_index(drop=True)
        ], axis=1)
        
        # Normalisasi
        features_scaled = scaler.transform(features)
        
        logger.info("Model, encoders and data loaded successfully")
        logger.info(f"Available moods: {le.classes_}")
        logger.info(f"Available genres: {mlb.classes_}")
        logger.info(f"Dataset shape: {df.shape}")
        logger.info(f"Features shape: {features_scaled.shape}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error loading model or data: {str(e)}")
        return False

def recommend_movies_by_mood(mood_input, top_k=5):
    """
    Fungsi rekomendasi berdasarkan mood - diambil dari inference code
    """
    try:
        mood_input = mood_input.capitalize()
        
        if mood_input not in le.classes_:
            return {
                "error": f"Mood '{mood_input}' tidak dikenali. Pilih salah satu dari: {list(le.classes_)}"
            }

        matching_indices = df[df['mood'] == mood_input].index.tolist()
        
        if len(matching_indices) == 0:
            return {
                "error": f"Tidak ada film yang cocok untuk mood '{mood_input}'."
            }
        
        logger.info(f"Ditemukan {len(matching_indices)} film untuk mood {mood_input}")
        
        X_subset = features_scaled[matching_indices]

        preds = model.predict(X_subset)
        
        label_target = int(le.transform([mood_input])[0])
        match_score = preds[:, label_target].flatten()  
        
        top_indices = np.argsort(match_score)[::-1][:top_k].tolist() 
        result_indices = [matching_indices[i] for i in top_indices]
        
        recommended_movies = df.loc[result_indices]
        
        return {
            "success": True,
            "mood": mood_input,
            "total_matching_movies": len(matching_indices),
            "recommendations": recommended_movies.to_dict('records'),
            "scores": match_score[top_indices].tolist() 
        }
        
    except Exception as e:
        logger.error(f"Error in recommend_movies_by_mood: {str(e)}")
        return {"error": str(e)}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        logger.info(f"Received request data: {data}")
        
        mood = data.get('mood')
        top_k = data.get('top_k', 5) 
        
        if not mood:
            return jsonify({"error": "Mood is required"}), 400
        
        try:
            top_k = int(top_k)
            top_k = max(1, min(5, top_k))
            logger.info(f"Using top_k value: {top_k}")
        except:
            top_k = 5 
            logger.info(f"Invalid top_k, using default: {top_k}")
        
        result = recommend_movies_by_mood(mood, top_k)
        
        logger.info(f"Result type: {type(result)}")
        if isinstance(result, dict):
            logger.info(f"Result keys: {result.keys()}")
            
        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 400
        
        recommendations = []
        for i, movie in enumerate(result['recommendations']):
            movie_dict = {}
            for key, value in movie.items():
                if isinstance(value, np.ndarray):
                    movie_dict[key] = value.tolist()
                elif isinstance(value, (np.int64, np.float64)):
                    movie_dict[key] = float(value) if isinstance(value, np.float64) else int(value)
                elif isinstance(value, list):
                    if len(value) > 0 and isinstance(value[0], np.ndarray):
                        movie_dict[key] = [item.tolist() for item in value]
                    else:
                        movie_dict[key] = value
                elif pd.api.types.is_scalar(value) and pd.isna(value):
                    movie_dict[key] = None
                else:
                    movie_dict[key] = value
            
            if i < len(result['scores']):
                movie_dict['prediction_score'] = float(result['scores'][i])
            recommendations.append(movie_dict)
        
        return jsonify({
            "mood": str(result['mood']),
            "total_matching_movies": int(result['total_matching_movies']),
            "returned_recommendations": len(recommendations),
            "recommendations": recommendations
        })
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/moods', methods=['GET'])
def get_moods():
    try:
        if le is None:
            return jsonify({"error": "Model not loaded"}), 500
        return jsonify({"moods": le.classes_.tolist()})
    except Exception as e:
        logger.error(f"Error getting moods: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/genres', methods=['GET'])
def get_genres():
    try:
        if mlb is None:
            return jsonify({"error": "Model not loaded"}), 500
        return jsonify({"genres": mlb.classes_.tolist()})
    except Exception as e:
        logger.error(f"Error getting genres: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/movie/<movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        try:
            numeric_id = int(movie_id)
        except ValueError:
            numeric_id = movie_id
            
        id_columns = ['movie_id', 'id', 'tmdb_id']
        found_movie = False
        movie_dict = None
        
        logger.debug(f"Mencari film dengan ID: {movie_id} (tipe: {type(movie_id)})")
        
        for col in id_columns:
            if col in df.columns:
                for search_id in [movie_id, numeric_id]:
                    matching_rows = df[df[col] == search_id]
                    if not matching_rows.empty:
                        movie_dict = matching_rows.iloc[0].to_dict()
                        found_movie = True
                        logger.debug(f"Film ditemukan menggunakan kolom {col} dengan ID {search_id}")
                        break
                if found_movie:
                    break
        
        if not found_movie or movie_dict is None:
            logger.warning(f"Film dengan ID {movie_id} tidak ditemukan")
            return jsonify({"error": "Movie not found"}), 404
        
        safe_dict = {}
        for key, value in movie_dict.items():
            try:
                if value is None or (hasattr(value, 'size') and value.size == 0):
                    safe_dict[key] = None
                    continue
                    
                if pd.isna(value) or (isinstance(value, float) and np.isnan(value)):
                    safe_dict[key] = None
                    continue
                    
                if isinstance(value, np.ndarray):
                    safe_dict[key] = value.tolist()
                    continue
                    
                if isinstance(value, (np.int64, np.int32, np.int16, np.int8)):
                    safe_dict[key] = int(value)
                    continue
                    
                if isinstance(value, (np.float64, np.float32, np.float16)):
                    safe_dict[key] = float(value)
                    continue
                    
                if isinstance(value, list):
                    if len(value) > 0 and isinstance(value[0], np.ndarray):
                        safe_dict[key] = [item.tolist() for item in value]
                    else:
                        safe_list = []
                        for item in value:
                            if isinstance(item, (np.int64, np.int32, np.int16, np.int8)):
                                safe_list.append(int(item))
                            elif isinstance(item, (np.float64, np.float32, np.float16)):
                                safe_list.append(float(item))
                            else:
                                safe_list.append(item)
                        safe_dict[key] = safe_list
                    continue
                    
                safe_dict[key] = value
                
            except Exception as inner_e:
                logger.error(f"Error memproses field {key}: {str(inner_e)}")
                safe_dict[key] = None
                
        return jsonify(safe_dict)
    except Exception as e:
        logger.error(f"Error in get_movie_details: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

logger.info("Initializing application...")
if not load_models_and_data():
    logger.error("Failed to load models and data during startup!")
else:
    logger.info("Application initialized successfully!")

# Initialize saat startup
if __name__ == '__main__':
    print("Running in development mode...")
    if model is None: 
        print("Loading models and data...")
        if load_models_and_data():
            print("Models and data loaded successfully!")
            print(f"Available moods: {le.classes_.tolist()}")
            print(f"Total movies in dataset: {len(df)}")
        else:
            print("Failed to load models and data!")
            exit(1)
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)