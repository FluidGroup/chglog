import { Label, PullRequest, User } from './fetch';

export interface Visitor {
  visitLabel(label: Label, source: PullRequest): void;
  visitAuthor(author: User, source: PullRequest): void;
}
