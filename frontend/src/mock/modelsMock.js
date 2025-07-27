const modelsMock = [
  {
    id: 1,
    name: "MyConnectXModel v1",
    task: "ConnectX",
    createdAt: "2025-07-15",
    isPublic: false,
    metrics: {
      accuracy: 0.82,
      f1: 0.78,
    },
  },
  {
    id: 2,
    name: "MNISTClassifier_v3",
    task: "MNIST",
    createdAt: "2025-07-14",
    isPublic: true,
    metrics: {
      accuracy: 0.95,
      f1: 0.94,
    },
  },
];

export default modelsMock;
