// init-mongo.d/init.js
// WARNING: This script runs only on first MongoDB startup.
// Credentials here are for development only. Change in production.

db.createCollection('test')
db = db.getSiblingDB('admin');

// Create API user with readWrite role
db.createUser(
  {
    user: "apiUser",
    pwd: "apiPassword", // TODO: Use env vars or secrets manager in production
    roles: [{ role: "readWrite", db: "admin" }]
  }
);

db = db.getSiblingDB('maindatabase');
db.rules.insertOne({
  _id: "rules_webhook",
  embed: {
    title: "🛡️ Reglas del Gremio / Condiciones del Clan",
    description: "_\"Este no es un lugar para almas sensibles. Aquí se forjan leyendas entre insultos, risas, combos y sarcasmo.\"_ \n— El tabernero.",
    color: 15158332,
    fields: [
      {
        name: "🎭 ¿Quiénes Somos?",
        value: "Refugio para aventureros digitales y guerreros del teclado. Aquí el bullying es con cariño y los chistes pegan como críticos emocionales."
      },
      {
        name: "⚠️ Advertencia de zona hostil",
        value: "- Si tu escudo emocional es de papel, quédate en la aldea.\n- Si no entiendes el humor rudo, mejor no entres.\n- Aquí se viene a reír, no a evangelizar."
      },
      {
        name: "✅ Al entrar, aceptas:",
        value: "- Humor negro y sin filtro.\n- Bullying consensuado.\n- Nadie te consiente, ni los mods."
      },
      {
        name: "✍️ Juramento de Entrada",
        value: "En el canal `#registro-del-gremio` escribe:\n`Juro por mi teclado mecánico que acepto estas condiciones y no lloraré por PvP verbal.`"
      }
    ],
    footer: {
      text: "Canal hostil para panas con coraza emocional.",
      icon_url: "https://i.imgur.com/lf7Fzvx.png"
    },
    timestamp: "2025-04-15T12:00:00.000Z"
  },
  buttons: [
    {
      type: 2,
      label: "Acepto",
      style: 3,
      custom_id: "accept_rules"
    },
    {
      type: 2,
      label: "No acepto",
      style: 4,
      custom_id: "decline_rules"
    }
  ]
});
