const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http')
const app =  require('../api/app')
const { User } = require('../database/models')
const { mockUserArray } = require('./__mocks__/userMocks');
const { mockData, mockToken } = require("./__mocks__/orderMock");
const jwt = require('jsonwebtoken');

chai.use(chaiHttp)

const { expect } = chai

describe('Teste da rota de User', () => {
  beforeEach(() => { sinon.stub(jwt, 'verify').onCall().returns(mockData)});
  afterEach(() => { sinon.restore() });

  it('Deve retornar um array de usuários da rota administrador', async () => {
    
    sinon.stub(User, 'findAll').resolves(mockUserArray)

    const response = await chai.request(app).get('/user/admin').set('authorization', mockToken);

    expect(response.status).to.be.equal(200)
    expect(response.body).to.be.an('array')
    expect(response.body[0]).to.have.property('id')
    expect(response.body[0]).to.have.property('name')
    expect(response.body[0]).to.have.property('role')
    expect(response.body[0].id).to.be.equal(1) 
    expect(response.body[0].name).to.be.equal('Delivery App Admin')
    expect(response.body[0].role).to.be.equal('administrator')

    User.findAll.restore();
  });

  it('Deve deletar um usuáio pela rota administrador', async () => {
    sinon.stub(User, 'destroy').resolves(1);

    const response = await chai.request(app).delete('/user/admin/3').set('authorization', mockToken);

    expect(response.status).to.be.equal(202);
  });
})
