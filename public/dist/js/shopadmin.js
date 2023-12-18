$( document ).ready(function() {
  var row;
  var Allproducts = []
  var Allcategories = []
  var categoriesid = []
  var categoryproducts = []
  var uniqueChars;

  function newrow(image,id,name,price,category){
        row = `<div class="col-12 col-md-6 col-lg-4 mb-4 productcard">
              <div style="cursor:pointer" class="card">
                <div class="image-height p-2">
                    <img data-id="${image}" src="${image}" class="card-img-top admin-image" alt="Laptop" />
                </div>

                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <p  class="small"><a href="#!" class="text-muted admin-category">${category}</a></p>
                  </div>

                  <div class="d-flex justify-content-between">
                    <h5 data-id="${id}" class="mb-0 admin-prodcut-name">${name}</h5>
                    <h5 class="text-dark mb-0">$<span class="admin-item-price">${price}</span></h5>
                  </div>
                </div>
              </div>
        </div>`
      $('#add-products').append(row)
  }

  function calculateStringWidth(str, font) {
    var element = document.createElement("canvas");
    var context = element.getContext("2d");
    context.font = font;
    var width = context.measureText(str).width;
    return width;
  }

  $.ajax({
      url:'http://localhost:3030/getproducts',
      success:function(res){
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

  $.ajax({
      url:'http://localhost:3030/getcategories',
      success:function(res){
          categoriesid = res
      }
  })

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

  function findObjectsByCategory(arr, name) {
    const resultObject = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].category_name.includes(name)) {
        resultObject.push(arr[i]);
      }
    }
    return resultObject;
  }

  function eachnewrow(arr){
      $.each(arr,(index,product)=>{
            newrow(product.image,product.id,product.product_name,product.price,product.category_name)
      })
  }

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

  function Addrow(name, id,price,image,category){
      row = `<div id="product-edit" class="card">
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><span>Id:<span id="admin-id">${id}</span></li>
                <li class="list-group-item"><span>Name:</span><span><input id="name-admin"  class="readonly" type="text" value="${name}" readonly></span></li>
                <li class="list-group-item"><span>Price:</span><span><input id="price-admin" class="readonly" type="text" value="${price}" readonly></span></li>
                <li class="list-group-item"><span>Image:</span><span><input id="image-admin" class="readonly" type="text" value="${image}" readonly></span></li>
                <li class="list-group-item"><span>Category:</span><span><select id="all_categories_admin"><option>${category}</option></select></span></li>
                <li id="li-save"><button type="button" id="edit-admin" class="btn btn-dark">Edit</button></li>
              </ul>
            </div>`
    $('#cart-items').html(row)    
  }

  $('.cards').on('click','.card',function(){

      if($(this).hasClass('chosen')){
          $(this).removeClass('chosen')
          $('#product-edit').remove()
          $('#cart-title').text('Edit on product or Add')
      }else{
          $('.card').removeClass('chosen')
          var name = $(this).find('.admin-prodcut-name').text();
          var id = $(this).find('.admin-prodcut-name').data('id')
          var price = $(this).find('.admin-item-price').text()
          var image = $(this).find('.admin-image').data('id');
          var category = $(this).find('.admin-category').text()
          Addrow(name,id,price,image,category)
          $(this).addClass('chosen')
          $('#cart-title').text(name)
      }
  })

  var nameadmin = ''
  var priceadmin = ''
  var imageadmin = ''
  var categroryadmin = ''

  $('#cart-items').on('click','#edit-admin',function(){

      if($('#edit-admin').text() == 'Edit'){
          $('.readonly').attr('readonly', false);
          nameadmin = $('#name-admin').val()
          priceadmin = $('#price-admin').val()
          imageadmin = $('#image-admin').val()
          categroryadmin = $('#all_categories_admin').val()
          var category_options = categoriesid.slice()
          
          let index = category_options.map(category => category.category_name).indexOf($('#all_categories_admin').val());
          let deletedid = category_options[index].id
          $('#all_categories_admin option:first').attr('data-id', `${deletedid}`);

          if (index !== -1) {
            category_options.splice(index, 1);
          }
          
          for(i=0;i<category_options.length;i++){
                $('#all_categories_admin').append(`<option data-id="${category_options[i].id}">${category_options[i].category_name}</option>`)
          }

          $('#li-save').append('<button style="width:100%;" type="button" id="cancel-edit" class="btn btn-dark">Cancel</button>')
          $('#edit-admin').text('Save')
      }else if($('#edit-admin').text() == 'Save'){
          $.ajax({
              url:'http://localhost:3030/adminedit',
              data:{
                name:$('#name-admin').val(),
                id:$('#admin-id').text(),
                price:$('#price-admin').val(),
                image:$('#image-admin').val(),
                categoryid:$('#all_categories_admin').find(':selected').data('id')
              },
              success:function(res){
                  $('.chosen').find('.admin-prodcut-name').text($('#name-admin').val())
                  $('.chosen').find('.admin-item-price').text($('#price-admin').val())
                  $('.chosen').find('.admin-category').text($('#all_categories_admin').val())
                  $('.chosen').find('.admin-image').attr('data-id',$('#image-admin').val());
                  $('.chosen').find('.admin-image').attr("src",$('#image-admin').val());
                  $('#edit-admin').text('Edit')
                  $('#cancel-edit').remove()
                  $('.readonly').attr('readonly', true);
              }
          })
      }
  })


  $('#cart-items').on('click','#cancel-edit',function(){
      $('#name-admin').val(nameadmin) 
      $('#price-admin').val(priceadmin) 
      $('#image-admin').val(imageadmin) 
      $('#all_categories_admin').html(`<option>${categroryadmin}</option>`) 
      $('#edit-admin').text('Edit')
      $('#cancel-edit').remove()
      $('.readonly').attr('readonly', true);
  })

  $('#admin-add').on('click',function(){
      if($('.card').hasClass('chosen')){
          $('.chosen').removeClass('chosen')
      }
      var category_options = categoriesid.slice()
      row = `<div id="product-save" class="card">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><span>Name:</span><span><input id="name-admin"  class="readonly" type="text"></span></li>
                  <li class="list-group-item"><span>Price:</span><span><input id="price-admin" class="readonly" type="text"></span></li>
                  <li class="list-group-item"><span>Image:</span><span><input id="image-admin" class="readonly" type="text"></span></li>
                  <li class="list-group-item"><span>Category:</span><span><select id="all_categories_admin"></select></span></li>
                  <li id="li-save"><button type="button" id="add-admin" class="btn btn-dark">Add</button></li>
                </ul>
            </div>`
      $('#cart-items').html(row)
      for(i=0;i<category_options.length;i++){
          $('#all_categories_admin').append(`<option data-id="${category_options[i].id}">${category_options[i].category_name}</option>`)
      }
  })

  $('#cart-items').on('click','#add-admin',function(){
      if($('#name-admin').val() != '' && $('#price-admin').val() != ''&& $('#image-admin').val() != ''&& $('#all_categories_admin').val() != ''){
          $.ajax({
              url:'http://localhost:3030/addproduct',
              data:{
                    name:$('#name-admin').val(),
                    price:$('#price-admin').val(),
                    image:$('#image-admin').val(),
                    categoryid:$('#all_categories_admin').find(':selected').data('id')  
              },
              success:function(res){
                  row = `<div class="col-12 col-md-6 col-lg-4 mb-4 productcard">
                              <div style="cursor:pointer" class="card">
                                <div class="image-height p-2">
                                    <img data-id="${$('#image-admin').val()}" src="${$('#image-admin').val()}" class="card-img-top admin-image">
                                </div>

                                <div class="card-body">
                                  <div class="d-flex justify-content-between">
                                    <p class="small"><a href="#!" class="text-muted admin-category">${$('#all_categories_admin').val()}</a></p>
                                  </div>

                                  <div class="d-flex justify-content-between">
                                    <h5 data-id="26" class="mb-0 admin-prodcut-name">${$('#name-admin').val()}</h5>
                                    <h5 class="text-dark mb-0">$<span class="admin-item-price">${$('#price-admin').val()}</span></h5>
                                  </div>
                                </div>
                              </div>
                        </div>`
                    $('#add-products').append(row)
                    $('#product-save').remove()
              }
          })
      }else{
        alert('fill all the fields')
      }
    }) 
});
