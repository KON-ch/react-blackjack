export class Reward {
  constructor(amount) {
    this.amount = amount
  }

  add(amount) {
    return new Reward(this.amount + amount)
  }
}
