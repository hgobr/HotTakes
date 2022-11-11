const Sauce = require('../models/sauceModel');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,

    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce created!' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  if (req.file) {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        const sauceObject = {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.file.filename
          }`,
        };
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Sauce updated!' }))
          .catch((error) => res.status(400).json({ error }));
      });
    });
  } else {
    const sauceObject = { ...req.body };
    Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: 'Sauce updated!' }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce deleted!' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (req.body.like === 1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: req.body.like++ },
            $push: { usersLiked: req.body.userId },
            _id: req.params.id,
          }
        )
          .then(() => res.status(200).json({ message: 'Sauce liked!' }))
          .catch((error) => res.status(400).json({ error }));
      } else if (req.body.like === -1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: req.body.like * -1 },
            $push: { usersDisliked: req.body.userId },
            _id: req.params.id,
          }
        )
          .then(() => res.status(200).json({ message: 'Sauce disliked!' }))
          .catch((error) => res.status(400).json({ error }));
      } else {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
              _id: req.params.id,
            }
          )
            .then(() => res.status(200).json({ message: 'Sauce unliked!' }))
            .catch((error) => res.status(400).json({ error }));
        } else {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
              _id: req.params.id,
            }
          )
            .then(() => res.status(200).json({ message: 'Sauce undisliked!' }))
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
