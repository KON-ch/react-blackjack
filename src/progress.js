export class Progress {
  static STATUS = ['setup', 'start', 'finish']
  static MAX_STEP = Progress.STATUS.length
  static MIN_STEP = 0

  constructor(step = 0) {
    this.step = step
    this.status = Progress.STATUS[step]
  }

  next() {
    if (this.step >= Progress.MAX_STEP) { return }

    return new Progress(this.step + 1)
  }

  finish() {
    return new Progress(Progress.MAX_STEP)
  }

  isSetup() {
    return this.step === Progress.MIN_STEP
  }

  isFinish() {
    return this.step === Progress.MAX_STEP
  }
}
