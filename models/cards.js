var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cardSchema = new Schema({
  name: String,
  strength: Number,
  vitality: Number,
  sanity: Number,
  cost: Number,
  fullImage: String,
  rarity: String,
  buyPrice: Number,
  sellPrice: Number,
  abilities: [{ firstAbi: String, secondAbi: String }],
  uid: String
});

module.exports = mongoose.model("Cards", cardSchema);