/**
 * Mock Bruno data for Storybook
 * Contains pre-parsed BrunoRequest objects and FileTree structure
 */

import type { FileTree } from '@principal-ade/panel-framework-core';
import type { BrunoRequest } from '../types';

/**
 * Mock pre-parsed BrunoRequest objects keyed by path
 * In production, the host would parse .bru files using @usebruno/lang
 */
export const mockBrunoRequests: Record<string, BrunoRequest> = {
  '/collection/users/get-users.bru': {
    meta: { name: 'Get All Users', type: 'http', seq: 1 },
    http: { method: 'get', url: 'https://api.example.com/users' },
    headers: [
      { name: 'Accept', value: 'application/json', enabled: true },
      { name: 'Authorization', value: 'Bearer {{token}}', enabled: true },
    ],
    params: [
      { name: 'page', value: '1', enabled: true, type: 'query' },
      { name: 'limit', value: '10', enabled: true, type: 'query' },
    ],
  },

  '/collection/users/get-user.bru': {
    meta: { name: 'Get User by ID', type: 'http', seq: 2 },
    http: { method: 'get', url: 'https://api.example.com/users/:id' },
    headers: [{ name: 'Accept', value: 'application/json', enabled: true }],
    params: [{ name: 'id', value: '123', enabled: true, type: 'path' }],
  },

  '/collection/users/create-user.bru': {
    meta: { name: 'Create User', type: 'http', seq: 3 },
    http: { method: 'post', url: 'https://api.example.com/users', body: 'json' },
    headers: [{ name: 'Content-Type', value: 'application/json', enabled: true }],
    params: [],
    body: {
      json: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }, null, 2),
    },
  },

  '/collection/auth/login.bru': {
    meta: { name: 'Login', type: 'http', seq: 1 },
    http: { method: 'post', url: 'https://api.example.com/auth/login', body: 'json' },
    headers: [{ name: 'Content-Type', value: 'application/json', enabled: true }],
    params: [],
    body: {
      json: JSON.stringify({ email: '{{email}}', password: '{{password}}' }, null, 2),
    },
  },

  '/collection/health-check.bru': {
    meta: { name: 'Health Check', type: 'http', seq: 1 },
    http: { method: 'get', url: 'https://api.example.com/health' },
    headers: [],
    params: [],
  },
};

/**
 * Mock FileTree for Bruno collection
 */
export const mockBrunoFileTree: FileTree = {
  sha: 'mock-sha-123',
  root: {
    path: '/collection',
    name: 'collection',
    relativePath: '',
    depth: 0,
    fileCount: 5,
    totalSize: 2048,
    children: [
      {
        path: '/collection/users',
        name: 'users',
        relativePath: 'users',
        depth: 1,
        fileCount: 3,
        totalSize: 1024,
        children: [
          {
            path: '/collection/users/get-users.bru',
            name: 'get-users.bru',
            relativePath: 'users/get-users.bru',
            extension: '.bru',
            size: 256,
            lastModified: new Date('2024-01-15'),
            isDirectory: false,
          },
          {
            path: '/collection/users/get-user.bru',
            name: 'get-user.bru',
            relativePath: 'users/get-user.bru',
            extension: '.bru',
            size: 200,
            lastModified: new Date('2024-01-15'),
            isDirectory: false,
          },
          {
            path: '/collection/users/create-user.bru',
            name: 'create-user.bru',
            relativePath: 'users/create-user.bru',
            extension: '.bru',
            size: 300,
            lastModified: new Date('2024-01-15'),
            isDirectory: false,
          },
        ],
      },
      {
        path: '/collection/auth',
        name: 'auth',
        relativePath: 'auth',
        depth: 1,
        fileCount: 1,
        totalSize: 512,
        children: [
          {
            path: '/collection/auth/login.bru',
            name: 'login.bru',
            relativePath: 'auth/login.bru',
            extension: '.bru',
            size: 280,
            lastModified: new Date('2024-01-15'),
            isDirectory: false,
          },
        ],
      },
      {
        path: '/collection/health-check.bru',
        name: 'health-check.bru',
        relativePath: 'health-check.bru',
        extension: '.bru',
        size: 100,
        lastModified: new Date('2024-01-15'),
        isDirectory: false,
      },
    ],
  },
  allFiles: [
    {
      path: '/collection/users/get-users.bru',
      name: 'get-users.bru',
      relativePath: 'users/get-users.bru',
      extension: '.bru',
      size: 256,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    },
    {
      path: '/collection/users/get-user.bru',
      name: 'get-user.bru',
      relativePath: 'users/get-user.bru',
      extension: '.bru',
      size: 200,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    },
    {
      path: '/collection/users/create-user.bru',
      name: 'create-user.bru',
      relativePath: 'users/create-user.bru',
      extension: '.bru',
      size: 300,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    },
    {
      path: '/collection/auth/login.bru',
      name: 'login.bru',
      relativePath: 'auth/login.bru',
      extension: '.bru',
      size: 280,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    },
    {
      path: '/collection/health-check.bru',
      name: 'health-check.bru',
      relativePath: 'health-check.bru',
      extension: '.bru',
      size: 100,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    },
  ],
  allDirectories: [
    {
      path: '/collection',
      name: 'collection',
      relativePath: '',
      depth: 0,
      fileCount: 5,
      totalSize: 2048,
      children: [],
    },
    {
      path: '/collection/users',
      name: 'users',
      relativePath: 'users',
      depth: 1,
      fileCount: 3,
      totalSize: 1024,
      children: [],
    },
    {
      path: '/collection/auth',
      name: 'auth',
      relativePath: 'auth',
      depth: 1,
      fileCount: 1,
      totalSize: 512,
      children: [],
    },
  ],
  stats: {
    totalFiles: 5,
    totalDirectories: 3,
    totalSize: 2048,
    maxDepth: 2,
  },
  metadata: {
    id: 'mock-collection-tree',
    timestamp: new Date('2024-01-15'),
    sourceType: 'mock',
    sourceInfo: {},
  },
};

/**
 * Create a loadBruRequest mock that returns pre-parsed requests
 */
export const createMockLoadBruRequest = (requests: Record<string, BrunoRequest> = mockBrunoRequests) => {
  return async (path: string): Promise<BrunoRequest> => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Loading Bruno request:', path);

    const request = requests[path];
    if (request) {
      return request;
    }

    throw new Error(`Mock request not found: ${path}`);
  };
};
