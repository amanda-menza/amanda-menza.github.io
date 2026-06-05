# Recipe Sharing Flask App

This project is a social recipe-sharing web application. Users can sign up, log in, create and edit recipes, upload recipe photos, follow other users, bookmark recipes, rate recipes, and browse feeds based on recency, ratings, followed users, and saved recipes.

## Tech stack

- Flask 2.3
- Flask-SQLAlchemy and SQLAlchemy
- Flask-Login
- Flask-Bcrypt
- Jinja templates
- SQLite for local development

## Project structure

| Path | Purpose |
| --- | --- |
| `recipe/__init__.py` | Flask application factory, database setup, login manager setup, and blueprint registration. |
| `recipe/auth.py` | Signup, login, logout, password hashing, and session handling. |
| `recipe/main.py` | Main routes for feeds, recipe CRUD, photo uploads, ratings, bookmarks, follows, profiles, and merch page. |
| `recipe/model.py` | SQLAlchemy models for users, recipes, ingredients, steps, ratings, photos, bookmarks, and follow relationships. |
| `recipe/templates/` | Jinja templates for auth pages, feeds, profile pages, recipe forms, recipe views, ratings, and merch. |
| `recipe/static/` | CSS, logo, merch images, and runtime photo-upload storage. |
| `requirements.txt` | Python dependencies for local setup. |

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app recipe run --debug
```

The app uses SQLite with the database URI configured in `recipe/__init__.py`. If you are running it from a fresh clone, initialize the database tables before using the app:

```bash
flask --app recipe shell
```

Then run:

```python
from recipe import db
db.create_all()
```

## Main routes

- `/` shows public and authenticated feeds.
- `/signup`, `/login`, and `/logout` handle account workflows.
- `/recipeForm` creates recipes with ingredients and steps.
- `/recipeView/<recipe_id>` displays a recipe, photos, bookmark state, and rating state.
- `/edit_recipeForm/<recipe_id>` edits existing recipes.
- `/photo_upload/<recipe_id>` uploads PNG or JPEG photos for a recipe.
- `/userView/<user_id>` displays a user's recipes, photos, followers, following, and bookmarks.
- `/follow/<user_id>` and `/unfollow/<user_id>` manage following relationships.
- `/bookmark/<recipe_id>` and `/unbookmark/<recipe_id>` manage saved recipes.
- `/ratingForm/<recipe_id>` records or updates recipe ratings.
- `/buyPage` displays the merch page.

## Data model

The app models a small social recipe domain:

- `User` accounts with hashed passwords, recipes, photos, bookmarks, ratings, followers, and following.
- `Recipe` entries with title, description, servings, cook time, timestamp, ingredients, steps, photos, bookmarks, and ratings.
- `Ingredient` and `Qingredient` records for reusable ingredient names with recipe-specific quantities and measures.
- `Step` records for ordered recipe instructions.
- `Photo` records for uploaded recipe images.
- `Bookmark` and `Rating` records for personalized recipe interactions.

## Maintenance notes

- Move `SECRET_KEY` into an environment variable before deploying the app.
- Keep the SQLite database, uploaded photos, virtual environments, and generated caches out of git.
- Add automated tests around auth, recipe creation/editing, uploads, and social interactions before treating this as production-ready.
- Consider adding migrations if the data model evolves beyond classroom or portfolio use.
