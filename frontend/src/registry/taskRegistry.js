import ConnectXView from '../tasks/ConnectX/ConnectXView';
import {useConnectXGame} from '../tasks/ConnectX/useConnectXGame';

import MnistView from '../tasks/MNIST/MnistView1.js';
import useMnistDuelGame from '../tasks/MNIST/useMnistDuelGame';

export const taskRegistry = {
  ConnectX: {
    View: ConnectXView,
    useGame: useConnectXGame,
  },
  MNIST: {
    View: MnistView,
    useGame: useMnistDuelGame,  
  },
  // ...其他任务继续注册
};