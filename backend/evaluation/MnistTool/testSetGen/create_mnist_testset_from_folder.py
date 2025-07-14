

import os
import numpy as np
from PIL import Image, ImageOps
import re

def extract_label(filename):
    # 从文件名开头提取纯数字作为标签
    match = re.match(r'^(\d+)', filename)
    if match:
        return int(match.group(1))
    else:
        raise ValueError(f"Cannot extract label from filename: {filename}")

def preprocess_image(img_path):
    img = Image.open(img_path).convert("L")  # 转为灰度图

    # ✅ 自动判断是否需要反转（白底黑字 → 黑底白字）
    if np.mean(img) > 128:
        img = ImageOps.invert(img)

    # ✅ 自动增强对比度
    img = ImageOps.autocontrast(img)

    img = img.resize((28, 28), Image.Resampling.LANCZOS)
    arr = np.array(img).astype("float32") / 255.0

    return arr.reshape(28, 28, 1)  # 保持与模型输入一致

def create_dataset_from_folder(folder_path, output_path="mnist_test_set.npz"):
    X_list, y_list = [], []

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            filepath = os.path.join(folder_path, filename)
            try:
                label = extract_label(filename)
                image = preprocess_image(filepath)
                X_list.append(image)
                y_list.append(label)
            except Exception as e:
                print(f"❌ Skipped {filename}: {e}")

    if not X_list:
        raise ValueError("No valid images found in the folder.")

    X = np.stack(X_list)
    y = np.array(y_list)

    np.savez(output_path, images=X, labels=y)
    print(f"✅ Saved {len(X)} samples to {output_path}")

# === 使用示例 ===
if __name__ == "__main__":
    create_dataset_from_folder("../digitPic", "../digitPic/mnist_test_set.npz")
