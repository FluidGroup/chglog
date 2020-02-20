import { azs } from "../index";

(async () => {
  await azs({
    repo: `xxx`,
    owner: `xxx`,
    base: "SNAPSHOT/v86.0.0/JP-AppStore.78373576.1",
    head: "master",
    githubAccessToken: ""
  });
})();
