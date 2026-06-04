import datetime
import pathlib
import dateutil.tz
from . import db, bcrypt
from flask import Blueprint, abort, current_app, flash, redirect, render_template, request, url_for
import flask_login
from flask_login import current_user

from . import model

bp = Blueprint("main", __name__)



@bp.route("/")

def home():
    followerFeed=[];
    bookmarkFeed=[];
    login=False
    recipeView=False
    if flask_login.current_user.is_authenticated:
        login=True;
        followers = db.aliased(model.User)
        query1 = (
        db.select(model.Recipe)
        .join(model.User)
        .join(followers, model.User.followers)
        .where(followers.id == flask_login.current_user.id)
        .order_by(model.Recipe.timestamp.desc())
        )
        followerFeed = db.session.execute(query1).scalars().all()
        query2=(
        db.select(model.Recipe).join(model.Bookmark, model.Recipe.id==model.Bookmark.recipe_id).filter(flask_login.current_user.id==model.Bookmark.user_id).order_by(model.Recipe.timestamp.desc())
        .order_by(model.Recipe.timestamp.desc())
       
        )
        bookmarkFeed = db.session.execute(query2).scalars().all()
    query3= (
    db.select(model.Recipe).order_by(model.Recipe.timestamp.desc())
   
    )
    timeFeed=db.session.execute(query3).scalars().all()
    query4= (
    db.select(model.Recipe).join(model.Rating, model.Recipe.id==model.Rating.recipe_id).order_by(model.Rating.value==True)
   
    )
    ratingFeed=db.session.execute(query4).scalars().all()

## would each of these feeds be part of different controllers or html templates
    return render_template("main/home.html", timeFeed=timeFeed, ratingFeed=ratingFeed, followerFeed=followerFeed, bookmarkFeed=bookmarkFeed, login=login)

@bp.route("/recipeView/<int:recipe_id>")
def recipeView(recipe_id):
    recipe = db.session.get(model.Recipe, recipe_id)
    if not recipe:
        abort(404, "Recipe id {} doesn't exist.".format(recipe_id))
    query = db.select(model.Photo).where(model.Photo.recipe == recipe)
    # .order_by(model.Photo.timestamp.desc())
    photos = db.session.execute(query).scalars().all()
    login=False
    bookmarked=False
    rated=False
    recipeView=True
    
    if current_user.is_authenticated:
        login=True
        user=db.session.get(model.User, current_user.id)
        query1=db.select(model.Bookmark).where(model.Bookmark.user_id==current_user.id).where(model.Bookmark.recipe_id==recipe_id)
        bookmarkQuery=db.session.execute(query1).scalars().one_or_none()
        if bookmarkQuery is not None:
            bookmarked=True
        query2=db.select(model.Rating).where(model.Rating.user_id==current_user.id).where(model.Rating.recipe_id==recipe_id)
        rateQuery=db.session.execute(query2).scalars().one_or_none()
        if rateQuery is not None:
            rated=True

    return render_template("main/recipeView.html", post=recipe, photos=photos, login=login, rated=rated, bookmarked=bookmarked, recipeView=recipeView)

@bp.route("/photo_upload/<int:recipe_id>", methods=["POST"])
@flask_login.login_required
def photo_upload(recipe_id):
    recipe = db.session.get(model.Recipe, recipe_id)
    if not recipe:
        abort(404, "Recipe id {} doesn't exist.".format(recipe_id))
    uploaded_file = request.files['photo']
    if uploaded_file.filename != '':
        content_type = uploaded_file.content_type
        if content_type == "image/png":
            file_extension = "png"
        elif content_type == "image/jpeg":
            file_extension = "jpg"
        else:
            abort(400, f"Unsupported file type {content_type}")
        photo = model.Photo(
        user=flask_login.current_user,
        recipe=recipe,
        file_extension=file_extension
        )
        db.session.add(photo)
        db.session.commit()
    else:
        abort(400,f"Missing file")
    path = (
    pathlib.Path(current_app.root_path)
    / "static"
    / "photos"
    / f"photo-{photo.id}.{file_extension}"
    )
    uploaded_file.save(path)

    
    return redirect(url_for("main.recipeView", recipe_id=recipe.id))

@bp.route("/removePhoto/<int:recipe_id>/<int:photo_id>/<string:file_ext>", methods=["POST"])
@flask_login.login_required
def removePhoto(recipe_id,photo_id,file_ext):
    photo=db.session.get(model.Photo, photo_id)
    db.session.delete(photo)
    db.session.commit()
    path = (
    pathlib.Path(current_app.root_path)
    / "static"
    / "photos"
    / f"photo-{photo_id}.{file_ext}"
    )
    pathlib.Path(path).unlink()

    
    return redirect(url_for("main.recipeView", recipe_id=recipe_id))

@bp.route("/ratingForm/<int:recipe_id>", methods=["GET"])
@flask_login.login_required
def ratingForm(recipe_id):
    return render_template("ratingForm.html", recipe_id=recipe_id)

@bp.route("/ratingForm/<int:recipe_id>", methods=["POST"])
@flask_login.login_required
def ratingForm_post(recipe_id):
    rateVal = request.form.get("star")
    recipe=db.session.get(model.Recipe, recipe_id)
    existing_rating = db.session.query(model.Rating).filter_by(user=flask_login.current_user, recipe=recipe).first()
    if existing_rating:
        # Update the existing rating value
        existing_rating.value = rateVal
    else:
        rating=model.Rating(user=current_user, value=rateVal, recipe=recipe)
        db.session.add(rating)
    db.session.commit()
    
    return redirect(url_for("main.recipeView", recipe_id=recipe.id))

@bp.route("/bookmark/<int:recipe_id>", methods=["POST"])
@flask_login.login_required
def bookmark(recipe_id):
    recipe=db.session.get(model.Recipe, recipe_id)
    bookmark=model.Bookmark(user=current_user, recipe=recipe)
    db.session.add(bookmark)
    db.session.commit()
    
    return redirect(url_for("main.recipeView", recipe_id=recipe.id))

@bp.route("/unbookmark/<int:recipe_id>", methods=["POST"])
@flask_login.login_required
def unbookmark(recipe_id):
    recipe=db.session.get(model.Recipe, recipe_id)
    user=flask_login.current_user
    query = db.select(model.Bookmark).where(recipe_id == recipe_id).where(user==flask_login.current_user)
    bookmark=db.session.execute(query).scalars().one_or_none()
    db.session.delete(bookmark)
    db.session.commit()
    
    return redirect(url_for("main.recipeView", recipe_id=recipe.id))

@bp.route("/userView/<int:user_id>")
def userView(user_id):
    user = db.session.get(model.User, user_id)
    if not user:
        abort(404, "User id {} doesn't exist.".format(user_id))
    query1 = db.select(model.Photo).where(model.Photo.user == user)
    # .order_by(model.Photo.timestamp.desc())
    photos = db.session.execute(query1).scalars().all()
    query2 = db.select(model.Recipe).where(model.Recipe.user == user).order_by(model.Recipe.timestamp.desc())
    recipes = db.session.execute(query2).scalars().all()
    authenticated=False
    selfProfile=False
    followBtn=None;
    bookmarks=None;
    if current_user.is_authenticated:
        authenticated=True
        if current_user.id==user_id:
            query3 = db.select(model.Recipe).join(model.Bookmark, model.Recipe.id==model.Bookmark.recipe_id).filter(current_user.id==model.Bookmark.user_id).order_by(model.Recipe.timestamp.desc())
            bookmarks = db.session.execute(query3).scalars().all()
            followBtn=None;
        elif flask_login.current_user in user.followers:
            followBtn="unfollow"
        else :
            followBtn="follow"
    
    return render_template("main/userView.html", recipes=recipes, photos=photos, authenticated=authenticated, followBtn=followBtn, bookmarks=bookmarks, user=user)

@bp.route("/follow/<int:user_id>", methods=["POST"])
@flask_login.login_required
def follow(user_id):
    user = db.session.get(model.User, user_id)
    if not user:
        abort(404, "User id {} doesn't exist.".format(user_id))
    if user==current_user:
        abort(403, "User id {} is the current user".format(user_id))
    if flask_login.current_user in user.followers:
        abort(403, "The current user is already following User id {}".format(user_id))
    user.followers.append(flask_login.current_user)
    db.session.commit()
    
    return redirect(url_for("main.userView", user_id=user_id))

@bp.route("/unfollow/<int:user_id>", methods=["POST"])
@flask_login.login_required
def unfollow(user_id):
    user = db.session.get(model.User, user_id)
    if not user:
        abort(404, "User id {} doesn't exist.".format(user_id))
    if user==current_user:
        abort(403, "User id {} is the current user".format(user_id))
    if not flask_login.current_user in user.followers:
        abort(403, "The current user is not following User id {}".format(user_id))
    user.followers.remove(flask_login.current_user)
    db.session.commit()
    
    return redirect(url_for("main.userView", user_id=user_id))

@bp.route("/followingView/<int:user_id>")
@flask_login.login_required
def followingView(user_id):
    user=db.session.get(model.User, user_id)
    query = db.select(model.User).where(model.User.followers.contains(user))
    follows = db.session.execute(query).scalars().all()

    return render_template("main/follow.html", follows=follows, user=user)

@bp.route("/followersView/<int:user_id>")
@flask_login.login_required
def followersView(user_id):
    user=db.session.get(model.User, user_id)
    query = db.select(model.User).where(model.User.following.contains(user))
    follows = db.session.execute(query).scalars().all()

    return render_template("main/follow.html", follows=follows, user=user)

@bp.route("/recipeForm")
@flask_login.login_required
def recipeForm():
    return render_template("main/recipeForm.html")


@bp.route("/recipeForm", methods=["POST"])
@flask_login.login_required
def recipeForm_post():
    title = request.form.get("title")
    description = request.form.get("description")
    servings = request.form.get("servings")
    cookTime=request.form.get("cooking-time")

    new_recipe = model.Recipe(title=title, user=current_user,description=description, servings=servings, cooktime=cookTime,timestamp=datetime.datetime.now(dateutil.tz.tzlocal()))
    db.session.add(new_recipe)
    db.session.commit()
    
    ingredient_fields = request.form.getlist("ingredient")
    ingredient_amt_fields = request.form.getlist("ingredient-amt")
    ingredient_measure_fields = request.form.getlist("ingredient-measure")

    for i in range(len(ingredient_fields)):
        ingredient_name = ingredient_fields[i]
        ingredient_amt=ingredient_amt_fields[i]
        ingredient_measure=ingredient_measure_fields[i]
        # Create and save the Ingredient entity
        query = db.select(model.Ingredient).where(model.Ingredient.name == ingredient_name)
        old_ingredient = db.session.execute(query).scalar_one_or_none()
        if not old_ingredient:
            new_ingredient = model.Ingredient(name=ingredient_name)
            db.session.add(new_ingredient)
            db.session.commit()
            ingredient_id=new_ingredient.id
        else:
            ingredient_id=old_ingredient.id
        new_qingredient = model.Qingredient(
            ingredient_id=ingredient_id,
            recipe_id=new_recipe.id, amount=ingredient_amt,measure=ingredient_measure)
        db.session.add(new_qingredient)
        db.session.commit()
    step_fields = request.form.getlist("step")
    for step_text in step_fields:
        # Create and save the Step entity, linking it to the Recipe
        new_step = model.Step(
        text=step_text,
        recipe_id=new_recipe.id
        )
        db.session.add(new_step)
        db.session.commit()
    
    return redirect(url_for("main.home"))

@bp.route("/edit_recipeForm/<int:recipe_id>")
@flask_login.login_required
def edit_recipeForm(recipe_id):
    recipe = db.session.get(model.Recipe, recipe_id)
    return render_template("main/edit_recipeForm.html", recipe=recipe)


@bp.route("/edit_recipeForm/<int:recipe_id>", methods=["POST"])
@flask_login.login_required
def edit_recipeForm_post(recipe_id):
    recipe = db.session.get(model.Recipe, recipe_id)
    for qingredient in recipe.qingredients:
        db.session.delete(qingredient)
    for step in recipe.steps:
        db.session.delete(step)
    recipe.title = request.form.get("title")
    recipe.description = request.form.get("description")
    recipe.servings = request.form.get("servings")
    recipe.cookTime=request.form.get("cooking-time")
    db.session.commit()
    
    ingredient_fields = request.form.getlist("ingredient")
    ingredient_amt_fields = request.form.getlist("ingredient-amt")
    ingredient_measure_fields = request.form.getlist("ingredient-measure")

    for i in range(len(ingredient_fields)):
        ingredient_name = ingredient_fields[i]
        ingredient_amt=ingredient_amt_fields[i]
        ingredient_measure=ingredient_measure_fields[i]
        # Create and save the Ingredient entity
        query = db.select(model.Ingredient).where(model.Ingredient.name == ingredient_name)
        old_ingredient = db.session.execute(query).scalar_one_or_none()
        if not old_ingredient:
            new_ingredient = model.Ingredient(name=ingredient_name)
            db.session.add(new_ingredient)
            db.session.commit()
            ingredient_id=new_ingredient.id
        else:
            ingredient_id=old_ingredient.id
        new_qingredient = model.Qingredient(
            ingredient_id=ingredient_id,
            recipe_id=recipe.id, amount=ingredient_amt,measure=ingredient_measure)
        db.session.add(new_qingredient)
        db.session.commit()
    step_fields = request.form.getlist("step")
    for step_text in step_fields:
        # Create and save the Step entity, linking it to the Recipe
        new_step = model.Step(
        text=step_text,
        recipe_id=recipe.id
        )
        db.session.add(new_step)
        db.session.commit()
    
    return redirect(url_for("main.recipeView", recipe_id=recipe_id))

@bp.route("/removeRecipe/<int:recipe_id>", methods=["POST"])
@flask_login.login_required
def removeRecipe(recipe_id):
    recipe=db.session.get(model.Recipe, recipe_id)
    for qingredient in recipe.qingredients:
        db.session.delete(qingredient)
    for step in recipe.steps:
        db.session.delete(step)
    for bookmark in recipe.bookmarks:
        db.session.delete(bookmark)
    for rating in recipe.ratings:
        db.session.delete(rating)
    for photo in recipe.responses:
        db.session.delete(photo)
        path = (
        pathlib.Path(current_app.root_path)
        / "static"
        / "photos"
        / f"photo-{photo.id}.{photo.file_extension}"
        )
        pathlib.Path(path).unlink()
    db.session.delete(recipe)
    db.session.commit()

    return redirect(url_for("main.home"))

@bp.route("/buyPage")
@flask_login.login_required
def buyPage():
    return render_template("main/buyPage.html")

    