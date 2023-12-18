$( document ).ready(function() {
    var productsCart = []
    var cartitems = 0
    var total = 0 
    var quantity = 0


    $('#checkoutview').on('click','.delete',function(){

      let numname = $(this).prev().prev().find('.product-child').data('id')
      let name = $(this).prev().prev().find('.product-child').text()
      let items = parseInt($(this).parent().find('.items').text())
      quantity -= items 
      const index = productsCart.indexOf(name);
      productsCart.splice(index,1)
      let price = parseFloat($(this).prev().find('.price').text())
      total -= price
      $('.add-price').text(total.toFixed(2));
      $('#view-items').text(quantity)
      $('.cart-nav').text(quantity)
      $(this).parent().parent().parent().parent().remove()
      $.ajax({
        url:'http://localhost:3030/deleteproduct',
        data:{
          name:numname,
        },
        success:function(res){
        }
      })
      cursor()
    })

    function Addrow(image, name,price,cartitems,productnum){
        row = `<div class="card">
                <div class="item-cart">
                  <div class="d-flex justify-content-between">
                    <div  class="d-flex flex-row align-items-center">
                        <img style="width:90px" src="${image}" class="img-fluid rounded-3 image-sidebar" alt="Shopping item" >
                    </div>
                    <div style="width:76vw" class="d-flex wrap   align-items-center">
                      <div class="product-name"> 
                        <h5 data-id="${productnum}" class="product-child">${name}</h5>
                      </div>
                      <div style="flex-basis:84%" class="product-price">
                        <h5>items:<span class="items">${cartitems}</span></h5>
                        <h5>$<span class="price">${price}</span></h5>
                      </div>
                      <a style="right:20px"  class="delete"><i class="fas fa-trash-alt fa-lg "></i></a>
                    </div>
                  </div>
                </div>
              </div>`
      $('#checkoutview').append(row)
    }

    function cursor() {
        if(quantity == 0 ) {
            $('#btn-proceed').remove()
            $('#shoping_cart_view').append('<p class="mb-0 pl-5">Add some products to proceed</p>')
        }else{
            $('#btn-price').css('cursor','pointer')
            $('#btn-price').prop('disabled', false);
        }
    }


    $.ajax({
        url:'http://localhost:3030/getcart',
        success:function(res){
            let cartproducts = res
            $.each(cartproducts,(index,product)=>{
                cartitems+=product.quantity
                total += product.price
                quantity+=product.quantity
                Addrow(product.image,product.product_name,product.price,product.quantity,product.product)
                productsCart.push(product.product_name)
            })
            $('.cart-nav').text(cartitems)
            $('#view-items').text(quantity)
            $('.add-price').text(total.toFixed(2))
            cursor()
        }
    })

    $('#continue-shoping').on('click',function(){
        location.href = '/shop'
    })

    $('#btn-proceed').on('click',function(){  
      $.ajax({
        url:'http://localhost:3030/checkout',
        success:function(res){
          location.href = '/checkout';
        }
      })
    })
})

