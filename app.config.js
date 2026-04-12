const appConfig = require('./app.json');

module.exports = () => ({
  ...appConfig,
  expo: {
    ...appConfig.expo,
    extra: {
      ...appConfig.expo.extra,
      supabaseProjectId:
        process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID ?? process.env.VITE_SUPABASE_PROJECT_ID ?? '',
      supabasePublishableKey:
        process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
        '',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
    },
  },
});
