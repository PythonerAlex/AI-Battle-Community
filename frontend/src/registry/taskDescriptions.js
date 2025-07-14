// src/registry/taskDescriptions.js

export const taskDescriptions = {
  ConnectX: `ConnectX is a 2-player turn-based grid game similar to Connect Four.
Models are expected to output a column index (0–6) as their move. The game ends when a player connects 4 in a row.`,

  MNIST: `MNIST Duel is a digit classification task.
Each model receives an image (28x28) and must output the predicted digit (0–9).
Performance is evaluated by accuracy over a shared test set.`,

  CIFAR: `CIFAR Classify involves colored image classification with 10 categories.
Each model outputs a label for each image in the test set. Evaluated by classification accuracy.`,

  SAT: `SAT Duel is a multiple-choice question answering task (A/B/C/D).
Each model answers a set of SAT-style questions. Score is based on total correct answers.`,
};
