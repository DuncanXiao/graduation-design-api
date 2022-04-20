/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
  .createTable('menu', function (table) {
     table.increments('id').primary();
     table.string('url', 255);
     table.string('parent_id', 255);
     table.string('type', 255);
     table.string('name', 255);
     table.string('icon', 255);
     table.string('operator', 255);
     table.string('order', 255);
     table.timestamp('created_at').defaultTo(knex.fn.now());
     table.timestamp('updated_at')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
  .dropTable('menu')
};
