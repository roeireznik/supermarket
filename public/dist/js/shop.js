$( document ).ready(function() {

  var row;
  var productsCart = [];
  var total = 0
  var quantity = 0
  var Allproducts = []
  var Allcategories = []
  var categoryproducts = []


  //getting all the products from the data base
  function newrow(image,id,name,price,category){
        row = `<div class="col-12 col-md-6 col-lg-4 mb-4 productcard">
              <div class="card">
                <div class="image-height p-2">
                    <img data-id="${image}" src="${image}" class="card-img-top image" alt="Laptop" />
                </div>

                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <p  class="small"><a href="#!" class="text-muted">${category}</a></p>
                  </div>

                  <div class="d-flex justify-content-between mb-4">
                    <h5 data-id="${id}" class="mb-0 prodcut-name">${name}</h5>
                    <h5 class="text-dark mb-0">$<span class="item-price">${price}</span></h5>
                  </div>
                  <button type="button" class="btn btn-primary w-100 add-to-cart">Add to Cart</button>
                </div>
              </div>
        </div>`
       $('#add-products').append(row)

  }
  
  $.ajax({
      url:'http://localhost:3030/getproducts',
      success:function(res){
           var uniqueChars;
          $.each(res,(index,product)=>{
              Allproducts.push(product)
              newrow(product.image,product.id,product.product_name,product.price,product.category_name)
              Allcategories.push(product.category_name)
              uniqueChars = Allcategories.filter((element, index) => {
                  return Allcategories.indexOf(element) === index;
              });
          })
          for(i=0; i<uniqueChars.length; i++){
            $('#mySelect').append(`<option>${uniqueChars[i]}</option>`)
          }
      }
  })


  //searching in the array and returning all the products with the name searched
  function findObjectsByName(arr, partialName) {
    const resultObject = [];
    const partialNameLowerCase = partialName.toLowerCase();
    for (let i = 0; i < arr.length; i++) {
      const nameLowerCase = arr[i].product_name.toLowerCase();
      if (nameLowerCase.includes(partialNameLowerCase)) {
        resultObject.push(arr[i]);
      }
    }
    return resultObject;
  }

  //searching in the array and returning all the objects with the category chosen
  function findObjectsByCategory(arr, name) {
    const resultObject = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].category_name.includes(name)) {
        resultObject.push(arr[i]);
      }
    }
    return resultObject;
  }

  //מוסיף לבאדי את כל המוצרים
  function eachnewrow(arr){
      $.each(arr,(index,product)=>{
            newrow(product.image,product.id,product.product_name,product.price,product.category_name)
      })
  }

  //מחזיר את כל האובייקטים של המערך עם השם שהוקלד או חלק ממנו
  function search(array){
      var shopsearch = $('#shop-search').val()
      const searchResult = findObjectsByName(array, shopsearch);
      eachnewrow(searchResult)
  }

  $('#btn-left').on('click',function(){
      $('.productcard').remove()
      if($('#mySelect').val() == 'All'){
          search(Allproducts) 
      }else{
          search(categoryproducts) 
      }
  })

  //אם מחקתי את האינפוט והוא שווה לכלום אז מחזיר את כל המוצרים אם לחצתי אנטר מחפש
  $('#shop-search').on('keyup',function(event){
      if( $('#shop-search').val() == '' || $('#shop-search').val() == ' '){
        $('.productcard').remove()
        var selectsearch;
        if($('#mySelect').val() == 'All'){
            selectsearch = Allproducts
        }else{
          selectsearch = categoryproducts
        }

        eachnewrow(selectsearch)

      }

      if(event.key  === "Enter") {
          $('#btn-left').trigger("click")
      }
  })

  //מחשב את אורך הסטרינג על מנת שהסלקט ישתנה לפי הגודל של האופציה
  function calculateStringWidth(str, font) {
    var element = document.createElement("canvas");
    var context = element.getContext("2d");
    context.font = font;
    var width = context.measureText(str).width;
    return width;
  }

  $('#mySelect').on('change',function(){
      $('.productcard').remove()
      categoryproducts = []
      var selectsearch;
      
      var font = "16.5px Arial";
      var width = calculateStringWidth($('#mySelect').val(), font);
      $('#mySelect').css('width',width + 23 + 'px')

      if($('#mySelect').val() == 'All'){
          selectsearch = Allproducts
      }else{
        selectsearch = findObjectsByCategory(Allproducts, $('#mySelect').val());
      }
      $.each(selectsearch,(index,product)=>{
            categoryproducts.push(product)
            newrow(product.image,product.id,product.product_name,product.price,product.category_name)
      })
  })

  //מחזיר את העגלה ממסד הנתונים ומידה ולא עשינו לוג אווט
  function Addrow(image, name,price,productid,cartitems,productnum){
    row = `<div class="card">
            <div class="item-cart">
              <div class="d-flex justify-content-between">
                <div class="d-flex flex-row align-items-center w-25">
                    <img src="${image}" class="img-fluid rounded-3 image-sidebar" alt="Shopping item" >
                </div>
                <div class="d-flex wrap w-75  align-items-center">
                  <div class="product-name"> 
                    <h5 data-id="${productnum}" class="product-child">${name}</h5>
                  </div>
                  <div class="product-price">
                    <h5>items:<span class="items" data-id="${productid}">${cartitems}</span></h5>
                    <h5>$<span class="price">${price}</span></h5>
                  </div>
                  <a  class="delete"><i class="fas fa-trash-alt fa-lg "></i></a>
                </div>
              </div>
            </div>
          </div>`
  $('#cart-items').append(row)
}

$.ajax({
      url:'http://localhost:3030/getcart',
      success:function(res){
          let cartproducts = res
          $.each(cartproducts,(index,product)=>{
              quantity += product.quantity
              total += product.price
              Addrow(product.image,product.product_name,product.price,product.product_name,product.quantity,product.product)
              productsCart.push(product.product_name)
          })

          $('.cart-nav').text(quantity)
          $('.add-price').text(total.toFixed(2))
          cursor()
      }
  })


  //במידה והוספתי פריק שכבר קיים מספרו יגדל בהתאם 
  function addcartitems(numname,cartitems,price){
      $.ajax({
        url:'http://localhost:3030/addproduct',
        data:{
          name:numname,
          quantity:cartitems,
          price:(price * cartitems),
        },
        success:function(res){
        }
      })
  }

  //במידה ומספר הפריטים שווים 0 כפתור המחיר של העגלה לא יהיה לחיץ
  function cursor() {
      if(quantity == 0 ) {
          $('#btn-price').css('cursor','not-allowed')
          $('#btn-price').prop('disabled', true);
      }else{
          $('#btn-price').css('cursor','pointer')
          $('#btn-price').prop('disabled', false);
      }
  }

  function checkout() {
      $.ajax({
          url:'http://localhost:3030/checkoutview',
          success:function(res){
              location.href = "/checkoutview"
          }
      })
  }

  //הוספה לעגלה
  $('.cards').on('click','.add-to-cart',function(){
      quantity++
      var name = $(this).parent().parent().find('.prodcut-name').text();
      var numname = $(this).parent().parent().find('.prodcut-name').data('id')
      var price = parseFloat($(this).prev().find('.item-price').text()); 
      var image = $(this).parent().parent().find('.image').data('id');
      if (!productsCart.includes(name)) {
        productsCart.push(name);
        Addrow(image, name,price,name,1,numname)
        addcartitems(numname,1,price)
      }else {

          var additem = parseInt($('#cart-items').find(`[data-id="${name}"]`).text()) + 1
          var addprice = parseFloat($('#cart-items').find(`[data-id="${name}"]`).parent().next().find('.price').text()) + price
          $('#cart-items').find(`[data-id="${name}"]`).text(additem)
          $('#cart-items').find(`[data-id="${name}"]`).parent().next().find('.price').text(addprice.toFixed(2))
          addcartitems(numname,additem,price)
      }

      total += parseFloat(price)
      $('.add-price').text(total.toFixed(2))
      $('.cart-nav').html(quantity)
      cursor()
  })


  $('.nav-cart').on('click',function(){
      if(quantity > 0){
        checkout()
      }
  })

  //מחיקה מהעגלה
  $('#cart').on('click','.delete',function(){
      let numname = $(this).prev().prev().find('.product-child').data('id')
      let name = $(this).prev().prev().find('.product-child').text()
      let items = parseInt($(this).parent().find('.items').text())
      quantity -= items
      const index = productsCart.indexOf(name);
      productsCart.splice(index,1)
      let price = parseFloat($(this).prev().find('.price').text())
      total -= price
      $('.cart-nav').text(quantity);

      $('.add-price').text(total.toFixed(2));
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
      if($('.add-price').text() == '-0.00') {
          $('.add-price').text('0.00')
          total = 0;
      }
  })

  $('#btn-price').on('click',function(){
      if(quantity > 0){
        checkout()
      }
  })
});
