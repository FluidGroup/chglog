import { Label, PullRequest, User } from "./fetch";

export interface Visitor {
  visit(source: PullRequest): void;
  visitLabel(label: Label, source: PullRequest): void;
  visitAuthor(author: User, source: PullRequest): void;
  render(): string;
}
