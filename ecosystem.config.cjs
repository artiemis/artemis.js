module.exports = {
  apps: [
    {
      name: "artemis",
      interpreter: "bun",
      script: "src/index.ts",
      time: true,
      env: {
        NODE_ENV: "production",
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
      },
    },
  ],
};
