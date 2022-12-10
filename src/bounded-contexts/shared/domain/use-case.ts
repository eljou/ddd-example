export abstract class UseCase<I, R> {
  abstract run(params: I): Promise<R>
}
