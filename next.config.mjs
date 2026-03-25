import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.peggy$/,
            use: [
                {
                    loader: path.resolve('./loaders/peggy-loader.js'),
                },
            ],
        });

        config.module.rules.push({
            test: /\.csv$/,
            use: ['csv-loader'],
        });

        return config;
    },
};

export default nextConfig;
