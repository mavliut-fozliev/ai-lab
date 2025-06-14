import * as tf from "@tensorflow/tfjs";
import { Action, StateVector } from "../interface/interface";

export class Model {
  private model: tf.Sequential;

  constructor(private epsilon: number, private gamma: number) {
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ inputShape: [25], units: 32, activation: "relu" }));
    this.model.add(tf.layers.dense({ units: 32, activation: "relu" }));
    this.model.add(tf.layers.dense({ units: 4, activation: "linear" }));
    this.model.compile({ optimizer: tf.train.adam(0.001), loss: "meanSquaredError" });
  }

  private actions = [0, 1, 2, 3];

  async selectAction(state: StateVector): Promise<Action> {
    if (Math.random() < this.epsilon) {
      const randIndex = Math.floor(Math.random() * this.actions.length);
      return this.actions[randIndex];
    }

    const prediction = this.model.predict(tf.tensor2d([state])) as tf.Tensor;
    const qValues = (await prediction.array()) as number[][]; // shape: [1][4]

    let bestIndex = 0;
    for (let i = 1; i < this.actions.length; i++) {
      if (qValues[0][i] > qValues[0][bestIndex]) {
        bestIndex = i;
      }
    }

    return this.actions[bestIndex];
  }

  async trainStep(state: StateVector, action: Action, reward: number, nextState: StateVector): Promise<void> {
    const currentQ = ((await this.model.predict(tf.tensor2d([state]))) as tf.Tensor).array() as Promise<number[][]>;
    const targetQ = (await currentQ)[0]; // [q0, q1, q2, q3]

    const nextQTensor = this.model.predict(tf.tensor2d([nextState])) as tf.Tensor;
    const nextQArray = (await nextQTensor.array()) as number[][];
    const nextQs = nextQArray[0];

    const maxNextQ = Math.max(...this.actions.map((a) => nextQs[a]));

    targetQ[action] = reward + this.gamma * maxNextQ;

    await this.model.fit(tf.tensor2d([state]), tf.tensor2d([targetQ]), { epochs: 1, verbose: 0 });
  }
}
