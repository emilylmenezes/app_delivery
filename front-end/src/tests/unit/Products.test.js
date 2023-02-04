import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import renderWithRouter from '../helpers/renderWithRouter';
import {
  cartStringfied,
  ordersListResponseData,
  productsResponseData,
  sellerResponseData,
  userStringfied,
} from '../helpers/constants';
import instance from '../../helpers/instance';

describe('Testando a página de Produtos', () => {
  const getProductPriceById = (id) => screen
    .getByTestId(`customer_products__element-card-price-${id}`);
  const getProductImage = (name) => screen.getByRole('img', { name });
  const getProductNameById = (id) => screen
    .getByTestId(`customer_products__element-card-title-${id}`);
  const getAllAddBtns = () => screen
    .getAllByRole('button', { name: 'Aumentar quantidade do produto' });
  const getAllRemoveBtns = () => screen
    .getAllByRole('button', { name: 'Diminuir quantidade do produto' });
  const getAllQtyInputs = () => screen.getAllByRole('spinbutton', { name: /quantidade do produto/i });
  const getCheckoutBtn = () => screen.getByRole('button', { name: /Preço Total do Carrinho/i });
  const getOrdersLink = () => screen.getByRole('link', { name: /meus pedidos/i });
  const getLogoutLink = () => screen.getByRole('link', { name: /sair/i });

  describe('Testando a existência da lista de cards com os produtos', () => {
    it('Deve existir uma lista de cards com a descrição, imagem, quantidade, preço e'
      + ' botões de adicionar e remover items do carrinho, além de '
      + 'um input mostrando a quantidade do produto selecionado. Deve tbm'
      + ' haver um botão desabilitado com o valor total do carrinho', () => {
      productsResponseData.data.forEach(({ id, name, price }) => {
        expect(getProductPriceById(id))
          .toHaveTextContent(`R$ ${price.replace('.', ',')}`);
        expect(getProductImage(name)).toBeInTheDocument();
        expect(getProductNameById(id)).toHaveTextContent(name);
      });
      expect(getAllAddBtns()).toHaveLength(productsResponseData.data.length);
      expect(getAllRemoveBtns()).toHaveLength(productsResponseData.data.length);
      expect(getAllQtyInputs()).toHaveLength(productsResponseData.data.length);
      getAllQtyInputs().forEach((input) => {
        expect(input).toHaveValue(0);
      });
      expect(getCheckoutBtn()).toHaveTextContent('R$ 0');
    });
  });

  describe('Testando a adição e remoção de produtos no Carrinho pelo botão', () => {
    it('Deve inserir produtos ao clicar no botão de +,'
      + ' e remover produtos ao clicar no botão de -'
      + ' alterando o valor total do carrinho', () => {
      const products = productsResponseData.data;
      let totalPrice = 0;

      // add all products
      for (let index = 0; index < products.length; index += 1) {
        userEvent.click(getAllAddBtns()[index]);
        userEvent.click(getAllAddBtns()[index]);
        expect(localStorage.setItem).toHaveBeenCalledTimes((index + 1) * 2);
        totalPrice += Number(products[index].price) * 2;
        totalPrice = Math.round(totalPrice * 100) / 100;
        const totalPriceStringfied = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        expect(getCheckoutBtn()).toHaveTextContent(totalPriceStringfied);
      }

      // remove all products
      for (let index = 0; index < products.length; index += 1) {
        userEvent.click(getAllRemoveBtns()[index]);
        userEvent.click(getAllRemoveBtns()[index]);
        const expectedCalls = index < products.length - 1
          ? (index + products.length + 1) * 2
          : (index + products.length) * 2 + 1;
        expect(localStorage.setItem).toHaveBeenCalledTimes(expectedCalls);
        totalPrice -= Number(products[index].price) * 2;
        totalPrice = Math.round(totalPrice * 100) / 100;
        const totalPriceStringfied = index < products.length - 1
          ? `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
          : 'R$ 0';
        expect(getCheckoutBtn()).toHaveTextContent(totalPriceStringfied);
      }
    });
  });

  describe('Testando a alteração manual de produtos no Carrinho pelo input', () => {
    it('Deve alterar quantidade produtos no carrinho ao digitar o valor'
      + ' no input de entrada de números'
      + ' alterando o valor total do carrinho e sendo possível remover'
      + ' os produtos pelos botões de remover logo em seguida', () => {
      const products = productsResponseData.data;
      let totalPrice = 0;

      // add all products by typing
      for (let index = 0; index < products.length; index += 1) {
        userEvent.type(getAllQtyInputs()[index], '1');
        expect(localStorage.setItem).toHaveBeenCalledTimes(index + 1);
        totalPrice += Number(products[index].price);
        totalPrice = Math.round(totalPrice * 100) / 100;
        const totalPriceStringfied = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        expect(getCheckoutBtn()).toHaveTextContent(totalPriceStringfied);
      }

      // remove all products
      for (let index = 0; index < products.length; index += 1) {
        userEvent.click(getAllRemoveBtns()[index]);
        const expectedCalls = index < products.length - 1
          ? index + products.length + 1
          : index + products.length;
        expect(localStorage.setItem).toHaveBeenCalledTimes(expectedCalls);
        totalPrice -= Number(products[index].price);
        totalPrice = Math.round(totalPrice * 100) / 100;
        const totalPriceStringfied = index < products.length - 1
          ? `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
          : 'R$ 0';
        expect(getCheckoutBtn()).toHaveTextContent(totalPriceStringfied);
      }
    });
  });

  describe('Testando a mudança para a página  de checkout', () => {
    it('Deve ir para a página de checkout ao clicar no botão de carrinho estando'
      + ' o mesmo desabilitado após houver a inserção de produtos', async () => {
      expect(getCheckoutBtn()).toBeDisabled();
      userEvent.type(getAllQtyInputs()[0], '3');
      userEvent.type(getAllQtyInputs()[1], '4');
      expect(getCheckoutBtn()).not.toBeDisabled();
      instance.get.mockResolvedValueOnce(sellerResponseData);
      localStorage.getItem.mockReturnValueOnce(cartStringfied)
        .mockReturnValue(userStringfied);
      userEvent.click(getCheckoutBtn());
      await waitFor(() => {
        screen.getByRole('heading', { name: /finalizar pedido/i });
      });
    });
  });

  describe('Testando a existência do NavBar', () => {
    it('Deve existir um link para a página de Meus Pedidos, '
      + 'um texto informando o nome do usuário, um link para Sair'
      + ' e deslogar, e Texto com o nome de Produtos', async () => {
      expect(screen.getByText(/produtos/i)).toBeInTheDocument();
      expect(getOrdersLink()).toBeInTheDocument();
      expect(screen.getByText(/cliente da silva/i)).toBeInTheDocument();
      expect(getLogoutLink()).toBeInTheDocument();
    });
  });

  describe('Testando os links do Navbar', () => {
    it('Deve ir para a tela de meus pedidos ao clicar em Meus Pedidos', async () => {
      instance.get.mockResolvedValueOnce(ordersListResponseData);
      userEvent.click(getOrdersLink());
      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /pedido/i })).toHaveLength(ordersListResponseData.data.length);
      });
    });

    it('Deve voltar para a tela de Login e remover o usuário do'
      + ' localStorage ao clicar em Sair', async () => {
      expect(getLogoutLink()).toBeInTheDocument();
      localStorage.getItem.mockReturnValue(null);
      userEvent.click(getLogoutLink());
      expect(screen.getByRole('textbox', { name: /login/i })).toBeInTheDocument();
      screen.logTestingPlaygroundURL();
    });
  });

  beforeAll(() => {
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'removeItem');
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  beforeEach(() => {
    instance.get.mockResolvedValueOnce(productsResponseData);
    localStorage.getItem.mockReturnValue(userStringfied);
    renderWithRouter(<App />, { initialEntries: ['/customer/products'] });
  });

  afterEach(() => {
    localStorage.getItem.mockRestore();
    localStorage.setItem.mockRestore();
    instance.get.mockRestore();
  });

  afterAll(() => {
    Storage.prototype.setItem.mockClear();
    Storage.prototype.getItem.mockClear();
    Storage.prototype.removeItem.mockClear();
    jest.clearAllMocks();
  });
});
