# uplane-take-home

A full-stack application that allows users to upload an image, process it through background removal and horizontal flipping, and then manage the resulting images.


## Repo Structure

```
uplane-take-home/
├── README.md        # Project readme
├── frontend         # Nuxt app lives in here
└── backend
    ├── supabase     # Backend + Database
    └── trigger      # Async tasks
```


## Rough explanation

- User uploads image to supabase storage
- This creates a new processing task
- Frontend listens to status object of that task
- The task triggers a call to trigger.dev
- Trigger.dev handles the image processing (background removal + flipping)
- when done, trigger.dev stores the processed image in supabase storage, sets the url for the new image and updates the status
- Frontend shows new image
- Possibility to delete the image
