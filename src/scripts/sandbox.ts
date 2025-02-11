import { findFirstUrl } from "../utils/functions";

const text =
  "I ended up doing https://cdn.discordapp.com/attachments/338689901111541760/1338884762785288253/image.png?ex=67acb51a&is=67ab639a&hm=92ed060dabffccf9544157da2922bce79386eca444a182db92f19d833d66fba6&b because yah";

console.log(findFirstUrl(text));
