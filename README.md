# uplane-take-home
A full-stack application that allows users to upload an image, process it through background removal and horizontal flipping, and then manage the resulting images.


## Structure

```
uplane-take-home/
├── .cursor/          # IDE configuration (hidden)
├── .gitignore        # Git ignore rules (hidden)
├── README.md         # Project readme
├── frontend/         # Nuxt app will live here
│   └── .gitkeep
└── backend/          # Supabase + Trigger.dev
    ├── .env.example
    ├── package.json
    ├── package-lock.json
    ├── trigger.config.ts
    └── trigger/
        ├── example.ts
        └── process-image.ts
```