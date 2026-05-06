// testing/core.routes.test.js

/*
const request = require('supertest');
const express = require('express');

// Routers under test
const itemRoute = require('../backend/routes/itemRoute');
const documentRoutes = require('../backend/routes/documentRoutes');
const adminRoutes = require('../backend/routes/adminRoutes');

// Mocks
jest.mock('../backend/models/Item');
jest.mock('../backend/models/Document');
jest.mock('../backend/models/User');
jest.mock('../backend/middleware/requireAdmin');

const Item = require('../backend/models/Item');
const Document = require('../backend/models/Document');
const User = require('../backend/models/User');
const requireAdmin = require('../backend/middleware/requireAdmin');

// make requireAdmin() just pass through and set an admin user
requireAdmin.mockImplementation(() => (req, _res, next) => {
  req.user = { sub: 'admin-id', role: 'admin' };
  next();
});

const createItemsApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/items', itemRoute); // e.g. /items/create-item, /items/:id
  return app;
};

const createDocumentsApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/documents', documentRoutes); // /documents, /documents/:id
  return app;
};

const createAdminApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/admin', adminRoutes); // /admin/stats, /admin/users, etc.
  return app;
};

/* =======================================================================
   ITEM ROUTES
======================================================================= 

describe('itemRoute', () => {
  let app;

  beforeEach(() => {
    app = createItemsApp();
    jest.clearAllMocks();
  });

  describe('POST /items/create-item', () => {
    it('400 when required fields missing', async () => {
      const res = await request(app)
        .post('/items/create-item')
        .send({ itemTitle: 'Title only' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields.');
    });

    it('201 on successful create', async () => {
      const savedItem = {
        _id: 'item-id',
        category: 'Work',
        itemTitle: 'My Item',
        itemDate: '2024-01-01',
        itemDescription: 'Desc',
        userEmail: 'user@example.com',
      };

      Item.prototype.save = jest.fn().mockResolvedValue(savedItem);

      const res = await request(app)
        .post('/items/create-item')
        .send({
          category: 'Work',
          itemTitle: 'My Item',
          itemDate: '2024-01-01',
          itemDescription: 'Desc',
          userEmail: 'user@example.com',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.itemTitle).toBe('My Item');
      expect(Item.prototype.save).toHaveBeenCalled();
    });
  });

  describe('GET /items', () => {
    it('returns filtered items by userEmail and q', async () => {
      const items = [{ _id: '1', itemTitle: 'Test', userEmail: 'u@e.com' }];

      Item.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(items),
      });

      const res = await request(app)
        .get('/items')
        .query({ userEmail: 'u@e.com', q: 'Test' });

      expect(res.statusCode).toBe(200);
      expect(Item.find).toHaveBeenCalledWith({
        userEmail: 'u@e.com',
        itemTitle: { $regex: 'Test', $options: 'i' },
      });
      expect(res.body).toEqual(items);
    });

    it('500 on fetch error', async () => {
      Item.find = jest.fn().mockImplementation(() => {
        throw new Error('boom');
      });

      const res = await request(app).get('/items');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch items');
    });
  });

  describe('GET /items/:id', () => {
    it('404 if item not found', async () => {
      Item.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/items/unknown');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });

    it('200 with item when found', async () => {
      const item = { _id: 'item-id', itemTitle: 'X' };
      Item.findById = jest.fn().mockResolvedValue(item);

      const res = await request(app).get('/items/item-id');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(item);
    });
  });

  describe('PUT /items/:id', () => {
    it('404 if item not found', async () => {
      Item.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .put('/items/nope')
        .send({ itemTitle: 'New' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });

    it('200 with updated item', async () => {
      const updated = { _id: 'item-id', itemTitle: 'Updated' };
      Item.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

      const res = await request(app)
        .put('/items/item-id')
        .send({ itemTitle: 'Updated' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updated);
    });
  });

  describe('DELETE /items/:id', () => {
    it('404 if item not found', async () => {
      Item.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const res = await request(app).delete('/items/nope');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });

    it('200 with ok true when deleted', async () => {
      Item.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'item-id' });

      const res = await request(app).delete('/items/item-id');

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});

/* =======================================================================
   DOCUMENT ROUTES
======================================================================= 

describe('documentRoutes', () => {
  let app;

  beforeEach(() => {
    app = createDocumentsApp();
    jest.clearAllMocks();
  });

  describe('POST /documents', () => {
    it('400 when missing required fields', async () => {
      const res = await request(app).post('/documents').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('201 on success with minimal required data', async () => {
      const doc = {
        _id: 'doc-id',
        title: 'My Doc',
        userEmail: 'user@example.com',
        formData: {},
        injectedItems: [],
      };
      Document.create = jest.fn().mockResolvedValue(doc);

      const res = await request(app)
        .post('/documents')
        .send({
          title: 'My Doc',
          userEmail: 'user@example.com',
          formData: {},
        });

      expect(res.statusCode).toBe(201);
      expect(Document.create).toHaveBeenCalledWith({
        title: 'My Doc',
        userEmail: 'user@example.com',
        formData: {},
        injectedItems: [],
      });
      expect(res.body).toEqual(doc);
    });
  });

  describe('GET /documents', () => {
    it('400 when userEmail missing', async () => {
      const res = await request(app).get('/documents');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('userEmail required');
    });

    it('200 returns user documents', async () => {
      const docs = [{ _id: '1', userEmail: 'u@e.com' }];
      Document.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(docs),
      });

      const res = await request(app)
        .get('/documents')
        .query({ userEmail: 'u@e.com' });

      expect(res.statusCode).toBe(200);
      expect(Document.find).toHaveBeenCalledWith({ userEmail: 'u@e.com' });
      expect(res.body).toEqual(docs);
    });
  });

  describe('GET /documents/:id', () => {
    it('404 if document not found', async () => {
      Document.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/documents/nope');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Document not found');
    });

    it('200 with document when found', async () => {
      const doc = { _id: 'doc-id', title: 'T' };
      Document.findById = jest.fn().mockResolvedValue(doc);

      const res = await request(app).get('/documents/doc-id');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(doc);
    });
  });

  describe('PUT /documents/:id', () => {
    it('404 if document not found', async () => {
      Document.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .put('/documents/nope')
        .send({ title: 'New' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Document not found');
    });

    it('200 with updated document', async () => {
      const updated = { _id: 'doc-id', title: 'Updated' };
      Document.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

      const res = await request(app)
        .put('/documents/doc-id')
        .send({ title: 'Updated' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updated);
    });
  });

  describe('DELETE /documents/:id', () => {
    it('404 if document not found', async () => {
      Document.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const res = await request(app).delete('/documents/nope');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Document not found');
    });

    it('200 with ok true when deleted', async () => {
      Document.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'doc-id' });

      const res = await request(app).delete('/documents/doc-id');

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});

/* =======================================================================
   ADMIN ROUTES
======================================================================= 

describe('adminRoutes', () => {
  let app;

  beforeEach(() => {
    app = createAdminApp();
    jest.clearAllMocks();
  });

  describe('GET /admin/stats', () => {
    it('returns counts for users, items, documents, active users', async () => {
      User.countDocuments = jest
        .fn()
        .mockResolvedValueOnce(10) // totalUsers
        .mockResolvedValueOnce(4); // activeUsers
      Item.countDocuments = jest.fn().mockResolvedValue(20);
      Document.countDocuments = jest.fn().mockResolvedValue(5);

      const res = await request(app).get('/admin/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        totalUsers: 10,
        totalItems: 20,
        totalDocuments: 5,
        activeUsers: 4,
      });
    });

    it('500 on error', async () => {
      User.countDocuments = jest.fn().mockRejectedValue(new Error('boom'));

      const res = await request(app).get('/admin/stats');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to load stats');
    });
  });

  describe('GET /admin/users', () => {
    it('returns list of users', async () => {
      const users = [{ _id: '1', email: 'a@b.com' }];
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(users),
        }),
      });

      const res = await request(app).get('/admin/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(users);
    });

    it('500 on error', async () => {
      User.find = jest.fn().mockImplementation(() => {
        throw new Error('boom');
      });

      const res = await request(app).get('/admin/users');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch users');
    });
  });

  describe('PATCH /admin/users/:id/role', () => {
    it('400 on invalid role', async () => {
      const res = await request(app)
        .patch('/admin/users/user-id/role')
        .send({ role: 'superuser' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid role');
    });

    it('404 if user not found', async () => {
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .patch('/admin/users/user-id/role')
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('200 with updated user', async () => {
      const updatedUser = { _id: 'user-id', role: 'admin' };
      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser),
      });

      const res = await request(app)
        .patch('/admin/users/user-id/role')
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updatedUser);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('400 when admin tries to delete self', async () => {
      const res = await request(app).delete('/admin/users/admin-id');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Cannot delete your own account');
    });

    it('404 if user not found', async () => {
      User.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const res = await request(app).delete('/admin/users/other-id');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('200 with ok true when deleted', async () => {
      User.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'other-id' });

      const res = await request(app).delete('/admin/users/other-id');

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('GET /admin/items', () => {
    it('returns all items', async () => {
      const items = [{ _id: '1' }];
      Item.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(items),
      });

      const res = await request(app).get('/admin/items');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(items);
    });

    it('500 on error', async () => {
      Item.find = jest.fn().mockImplementation(() => {
        throw new Error('boom');
      });

      const res = await request(app).get('/admin/items');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch items');
    });
  });

  describe('DELETE /admin/items/:id', () => {
    it('404 if item not found', async () => {
      Item.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const res = await request(app).delete('/admin/items/nope');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });

    it('200 with ok true when deleted', async () => {
      Item.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: '1' });

      const res = await request(app).delete('/admin/items/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('GET /admin/documents', () => {
    it('returns all documents', async () => {
      const docs = [{ _id: '1' }];
      Document.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(docs),
      });

      const res = await request(app).get('/admin/documents');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(docs);
    });

    it('500 on error', async () => {
      Document.find = jest.fn().mockImplementation(() => {
        throw new Error('boom');
      });

      const res = await request(app).get('/admin/documents');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch documents');
    });
  });

  describe('DELETE /admin/documents/:id', () => {
    it('404 if document not found', async () => {
      Document.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const res = await request(app).delete('/admin/documents/nope');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Document not found');
    });

    it('200 with ok true when deleted', async () => {
      Document.findByIdAndDelete = jest
        .fn()
        .mockResolvedValue({ _id: '1' });

      const res = await request(app).delete('/admin/documents/1');

           expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Document not found');
    });

    it('200 with ok true when deleted', async () => {
      Document.findByIdAndDelete = jest
        .fn()
        .mockResolvedValue({ _id: '1' });

      const res = await request(app).delete('/admin/documents/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});

*/