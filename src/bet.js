export class Bet {
  constructor(amount, doubleDownAmount = 0) {
    this.amount = amount
    this.doubleDownAmount = doubleDownAmount
  }

  add(amount) {
    new Bet(this.amount + amount)
  }

  remove() {
    new Bet(0)
  }

  isZero() {
    return this.amount === 0
  }

  doubleDown() {
    new Bet(this.amount, this.amount)
  }

  totalAmount() {
    return this.amount + this.doubleDownAmount
  }
}
