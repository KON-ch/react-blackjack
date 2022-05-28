export class Reward {
  constructor(amount) {
    this.amount = amount
  }

  add(amount) {
    new Reward(this.amount + amount)
  }
}
