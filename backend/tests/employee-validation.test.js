import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createEmployeeSchema, updateEmployeeSchema } from '../src/validators/index.js';
import { ROLES, SERVICES, AUDIT_ACTIONS } from '../src/constants/index.js';

describe('Super Admin Employee Generation & Role Assignment Validation', () => {
  describe('1. Schema Validation for Employee Creation & Credential Generation', () => {
    test('Should accept valid payload with explicit username, password, and assigned role', () => {
      const payload = {
        name: 'John Connor',
        username: 'john.connor',
        email: 'john@ogmedia.agency',
        role: ROLES.ADMIN,
        expertise: [SERVICES.META_ADS, SERVICES.SEO],
        temporaryPassword: 'SuperKey2026!@'
      };

      const parsed = createEmployeeSchema.parse(payload);
      assert.equal(parsed.name, 'John Connor');
      assert.equal(parsed.username, 'john.connor');
      assert.equal(parsed.role, ROLES.ADMIN);
      assert.equal(parsed.temporaryPassword, 'SuperKey2026!@');
    });

    test('Should allow empty or omitted username to enable Super Admin auto-generation', () => {
      const payload = {
        name: 'Sarah Connor',
        email: 'sarah@ogmedia.agency',
        role: ROLES.EMPLOYEE,
        expertise: [SERVICES.META_ADS]
      };

      const parsed = createEmployeeSchema.parse(payload);
      assert.equal(parsed.name, 'Sarah Connor');
      assert.equal(parsed.username, '', 'Omitted username should default to empty string for auto-generation');
      assert.equal(parsed.role, ROLES.EMPLOYEE);
    });

    test('Should allow empty temporaryPassword to enable Super Admin key generation', () => {
      const payload = {
        name: 'Kyle Reese',
        email: 'kyle@ogmedia.agency',
        username: 'kyle.reese'
      };

      const parsed = createEmployeeSchema.parse(payload);
      assert.equal(parsed.temporaryPassword, '', 'Empty password should default to empty string for auto-generation');
    });

    test('Should reject invalid email format', () => {
      const payload = {
        name: 'Invalid Email Agent',
        email: 'not-an-email',
        username: 'invalid.agent'
      };

      assert.throws(() => createEmployeeSchema.parse(payload), /Invalid email address/);
    });

    test('Should reject invalid username characters', () => {
      const payload = {
        name: 'Invalid User Agent',
        email: 'agent@ogmedia.agency',
        username: 'bad username!'
      };

      assert.throws(() => createEmployeeSchema.parse(payload), /Username/);
    });
  });

  describe('2. Schema Validation for Role Assignment & Clearance Updates', () => {
    test('Should allow Super Admin to update role to SUPER_ADMIN, ADMIN, or EMPLOYEE', () => {
      const updateToAdmin = updateEmployeeSchema.parse({ role: ROLES.ADMIN });
      assert.equal(updateToAdmin.role, ROLES.ADMIN);

      const updateToSuperAdmin = updateEmployeeSchema.parse({ role: ROLES.SUPER_ADMIN });
      assert.equal(updateToSuperAdmin.role, ROLES.SUPER_ADMIN);

      const updateToEmployee = updateEmployeeSchema.parse({
        role: ROLES.EMPLOYEE,
        expertise: [SERVICES.WEB_DEVELOPMENT]
      });
      assert.equal(updateToEmployee.role, ROLES.EMPLOYEE);
      assert.deepEqual(updateToEmployee.expertise, [SERVICES.WEB_DEVELOPMENT]);
    });

    test('Should reject invalid role types', () => {
      assert.throws(() => updateEmployeeSchema.parse({ role: 'INVALID_ROLE' }));
    });
  });

  describe('3. Audit Actions Constants', () => {
    test('Should include EMPLOYEE_ROLE_CHANGED and EMPLOYEE_UPDATED', () => {
      assert.equal(AUDIT_ACTIONS.EMPLOYEE_ROLE_CHANGED, 'EMPLOYEE_ROLE_CHANGED');
      assert.equal(AUDIT_ACTIONS.EMPLOYEE_UPDATED, 'EMPLOYEE_UPDATED');
    });
  });
});
