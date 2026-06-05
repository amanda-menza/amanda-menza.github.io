

from . import db
import flask_login

class FollowingAssociation(db.Model):
    follower_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), primary_key=True, nullable=False
    )
    followed_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), primary_key=True, nullable=False
    )
class User(flask_login.UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    name = db.Column(db.String(64), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    recipes = db.relationship('Recipe', back_populates='user')
    following = db.relationship(
        "User",
        secondary=FollowingAssociation.__table__,
        primaryjoin=FollowingAssociation.follower_id == id,
        secondaryjoin=FollowingAssociation.followed_id == id,
        back_populates="followers",
    )
    followers = db.relationship(
        "User",
        secondary=FollowingAssociation.__table__,
        primaryjoin=FollowingAssociation.followed_id == id,
        secondaryjoin=FollowingAssociation.follower_id == id,
        back_populates="following",
    )
    photos=db.relationship('Photo', back_populates='user')
    bookmarks=db.relationship('Bookmark', back_populates='user')
    ratings=db.relationship('Rating', back_populates='user')

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='recipes')
    title=db.Column(db.String(128),nullable=False)
    description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime(), nullable=False)
    servings=db.Column(db.Integer, nullable=False)
    qingredients=db.relationship('Qingredient', back_populates='recipe')
    cooktime=db.Column(db.Integer, nullable=False)
    steps=db.relationship('Step', back_populates='recipe')
    responses = db.relationship('Photo', back_populates='recipe')
    bookmarks=db.relationship('Bookmark', back_populates='recipe')
    ratings=db.relationship('Rating', back_populates='recipe')
    def calculate_average_rating(self):
        if not self.ratings:
            return 0.0  # Return 0 if there are no ratings

        total_rating = 0
        for rating in self.ratings:
            total_rating += rating.value

        average_rating = total_rating / len(self.ratings)
        return average_rating
    
class Ingredient(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(64), nullable=False)
    qingredients=db.relationship("Qingredient", back_populates="ingredient")    

class Qingredient(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'))
    ingredient=db.relationship("Ingredient", back_populates="qingredients")
    recipe_id=db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    recipe=db.relationship('Recipe', back_populates='qingredients')
    amount=db.Column(db.Float, nullable=False)
    measure=db.Column(db.String(64), nullable=False)

class Step(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    recipe_id=db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    recipe=db.relationship('Recipe', back_populates='steps')
    text=db.Column(db.Text, nullable=False)

class Rating(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    recipe_id=db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    recipe=db.relationship('Recipe', back_populates='ratings')
    user = db.relationship('User', back_populates='ratings')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    value=db.Column(db.Integer, nullable=False)

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    recipe = db.relationship('Recipe', back_populates='responses')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', back_populates='photos')
    file_extension = db.Column(db.String(8), nullable=False)
    # timestamp = db.Column(db.DateTime(), nullable=False)

class Bookmark(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='bookmarks')
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    recipe = db.relationship('Recipe', back_populates='bookmarks')

