const Category = require('../models/category');
const Page = require('../models/page');
const Product = require('../models/product');
const User = require('../models/user');

async function createCategoryIndexes() {
    try {
      await Category.createIndexes();
      console.log('Category indexes created successfully');
    } catch (error) {
      console.error('Error creating Category indexes:', error);
    }
  }
  
  async function createPageIndex() {
    try {
      await Page.createIndexes();
      console.log('Page indexes created successfully');
    } catch (error) {
      console.error('Error creating Page indexes:', error);
    }
  }
  
  async function createProductIndexes() {
    try {
      await Product.createIndexes();
      console.log('Product indexes created successfully');
    } catch (error) {
      console.error('Error creating Product indexes:', error);
    }
  }
  
  async function createUserIndexes() {
    try {
      await User.createIndexes();
      console.log('User indexes created successfully');
    } catch (error) {
      console.error('Error creating User indexes:', error);
    }
  }
  
  module.exports = {
    createCategoryIndexes,
    createProductIndexes,
    createPageIndex,
    createUserIndexes,
  };
