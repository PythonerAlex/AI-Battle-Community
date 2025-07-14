# evaluation/mnist_evaluator.py
'''
import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.datasets import mnist

def load_test_data(test_file_path):
    # 加载指定路径的测试集文件（假设为 numpy 格式）
    if not os.path.exists(test_file_path):
        raise FileNotFoundError(f"Test file not found: {test_file_path}")

    # 默认使用 keras 的 MNIST 测试集作为回退方案（可选）
    try:
        (_, _), (X_test, y_test) = mnist.load_data()
        X_test = X_test[:1000]
        y_test = y_test[:1000]
    except:
        raise RuntimeError("Failed to load MNIST fallback dataset")

    X_test = X_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    return X_test, y_test
'''

import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.datasets import mnist

def load_test_data(test_file_path):
    """
    自动加载上传的测试集（npz格式），或 fallback 为 keras 自带测试集。
    """
    if test_file_path == "__default__":
        print("🌀 Using default keras MNIST test set (triggered by __default__)")
        (_, _), (X_test, y_test) = mnist.load_data()
        X_test = X_test[:1000]
        y_test = y_test[:1000]
    elif os.path.exists(test_file_path) and test_file_path.endswith(".npz"):
        try:
            with np.load(test_file_path) as data:
                X_test = data["images"]
                y_test = data["labels"]
                print(f"✅ Loaded test set from {test_file_path}, samples: {len(X_test)}")
        except Exception as e:
            print(f"⚠️ Failed to load {test_file_path}: {e}")
            raise RuntimeError("Invalid test file format.")
    else:
        raise FileNotFoundError(f"Test file not found: {test_file_path}")

    X_test = X_test.reshape(-1, 28, 28, 1).astype("float32") / 255.0
    return X_test, y_test

def evaluate_mnist_duel(payload):
    test_file_name = payload.get("testFileName")
    participants = payload.get("participants", [])
    rounds = int(payload.get("rounds", 1))
    room_id = payload.get("roomId")
    model_files = payload.get("modelFiles", {})

    if test_file_name == "__default__":
        test_file_path = "__default__"
    else:
        test_file_path = os.path.join("media", "test_sets", room_id, test_file_name)

    X_test, y_test = load_test_data(test_file_path)

    results = []

    for username in participants:
        model_file_name = model_files.get(username)
        if not model_file_name:
            results.append({
                "username": username,
                "score": 0.0,
                "error": "Model file not found"
            })
            continue

        model_path = os.path.join("media", "models", username, model_file_name)

        try:
            model = load_model(model_path)
            preds = model.predict(X_test)
            pred_labels = np.argmax(preds, axis=1)
            accuracy = float(np.mean(pred_labels == y_test))

            results.append({
                "username": username,
                "score": round(accuracy, 4),
            })
        except Exception as e:
            results.append({
                "username": username,
                "score": 0.0,
                "error": str(e)
            })

    results.sort(key=lambda r: r["score"], reverse=True)
    return results
