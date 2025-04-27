module.exports = {
    apps: [
        {
            name: 'psi-form',
            script: 'npm',
            args: 'start',
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};