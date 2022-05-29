export class Bet {
  constructor(amount, doubleDownAmount = 0) {
    this.amount = amount
    this.doubleDownAmount = doubleDownAmount
  }

  add(amount) {
    return new Bet(this.amount + amount)
  }

  remove() {
    return new Bet(0)
  }

  isZero() {
    return this.amount === 0
  }

  doubleDown() {
    return new Bet(this.amount, this.amount)
  }

  totalAmount() {
    return this.amount + this.doubleDownAmount
  }
}
