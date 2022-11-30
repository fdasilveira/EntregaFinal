/// <reference types="cypress" />
import { Home  } from "../support/pages/home";
import { ProductsPage } from "../support/pages/products";
import { ShopingCartPage } from "../support/pages/shopingCart";
import { CheckOutPage } from "../support/pages/checkOut";
import { ReciptPage } from "../support/pages/recipt";

describe('Entrega Final', () => 
{
    
    let productsshop;
    let checkout;
    
    const user = "frandasilveira";

    const home = new Home();
    const productsPage = new ProductsPage();
    const shopingCartPage = new ShopingCartPage();
    const checkoutPage = new CheckOutPage();
    const reciptPage = new ReciptPage();



    
    before('Before', () => {

        
        cy.fixture('productsshop').then(products =>{
            productsshop = products
        })
        cy.fixture('checkout').then(checkouts =>{
            checkout = checkouts
        })

        cy.request({
        url: "https://pushing-it-backend.herokuapp.com/api/register",
        method: "POST",
        body: {
            username: user,
            password: "123456!",
            gender: "other",
            day: "29",
            month: "10",
            year: "1989",
      },
    })
      .then((respuesta) => {
        expect(respuesta.status).equal(200);
      })
      .then(() => {
        cy.request({
          url: "http://pushing-it-backend.herokuapp.com/api/login",
          method: "POST",
          body: {
            username: user,
            password: "123456!",
          },
        }).then(respuesta => {
          window.localStorage.setItem('token', respuesta.body.token)
          window.localStorage.setItem('user', respuesta.body.user.username)
        });
      })
        cy.visit('');
    })

    it('entrega Final', () => {

        let suma = (productsshop.productOne.Price1) + (productsshop.productTwo.Price2);
        let priceOne = productsshop.productOne.Price1
        let priceTwo = productsshop.productTwo.Price2
        let completename = (checkout.Profile.Name)+(checkout.Profile.Lastname)
        
        
        home.clickButtonOnLineShop();
        productsPage.selectProduct(productsshop.productOne.Name);
        productsPage.clickOnClosemodal();
        productsPage.selectProduct(productsshop.productTwo.Name);
        productsPage.clickOnClosemodal();
        productsPage.clickButtonGoShoppingCart();
        reciptPage.verifyProduct(productsshop.productOne.Name).should("have.text", productsshop.productOne.Name);
        shopingCartPage.verifyPricesAndProducts(productsshop.productOne.Name,productsshop.productOne.Price1).should("have.text",`$${priceOne}`);
        reciptPage.verifyProduct(productsshop.productTwo.Name).should("have.text", productsshop.productTwo.Name);
        shopingCartPage.verifyPricesAndProducts(productsshop.productTwo.Name,productsshop.productTwo.Price2).should("have.text",`$${priceTwo}`);
        shopingCartPage.clickOnShowTotalPrice()
        shopingCartPage.checkAcumulatePrice().should('have.text',suma);
        shopingCartPage.clickOngoToCheckOut()
        checkoutPage.writeNameField(checkout.Profile.Name);
        checkoutPage.writeLastName(checkout.Profile.Lastname);
        checkoutPage.writeCreditCard(checkout.Profile.creditCardNumber);
        checkoutPage.clickPurchase()
        reciptPage.verifyLoading().should("exist");
        reciptPage.verifythankYouButton().should("have.text","Thank you");
        reciptPage.verifyCompleteName().invoke('text').then((sectext) => {
          assert.notStrictEqual(sectext, completename)});
        reciptPage.verifyProduct(productsshop.productOne.Name).should("have.text", productsshop.productOne.Name);
        reciptPage.verifyProduct(productsshop.productTwo.Name).should("have.text", productsshop.productTwo.Name);
        reciptPage.verifyCardNumber().should("have.text", checkout.Profile.creditCardNumber);
        reciptPage.verifyAmountTotal(suma);
    });
    after(() => {
      cy.request({
        url: `https://pushing-it-backend.herokuapp.com/api/deleteuser/${user}`,
        method: "DELETE",
        }).then(respuesta => {
          window.localStorage.setItem('token', respuesta.body.token)
          window.localStorage.setItem('user', respuesta.body.user.username)
        
        });
      });
});

