/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
  .createTable('users', function (table) {
     table.increments('id').primary();
     table.string('user_name', 255).notNullable();
     table.string('password', 255).notNullable();
     table.string('phone', 255);
     table.string('role', 255);
     table.string('operator', 255);
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
  .dropTable('users')
};
