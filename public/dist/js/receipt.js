$( document ).ready(function() {
      var items = ''
      var orderDetails;

      $.ajax({
          url:'http://localhost:3030/getreceipt',
          success:function(res){
              var products = res.products
              orderDetails = res
              $.each(products,function(index, item) {
                  items += `
    Item name:${item.name}
    Item quantity:${item.quantity}
    Unit Price:${item.price}
    Total price:${item.total}
    `  
              })
          }
      })

      $('#download').click(function() {
      // Set the file name and content
      var fileName = "FoodOnline.txt";
      var fileContent = 
    `Thank you for buying in our store

    Name:${orderDetails.name}                        
    Address:${orderDetails.address}             
    Order date:${orderDetails.orderDate}             
    Delivery Date:${orderDetails.deliveryDate}          
    Order price:${orderDetails.price}$ 
    ${items}`    

      // Create a Blob object from the file content
      var blob = new Blob([fileContent], {type: "text/plain"});

      // Create a link element for downloading the file
      var link = $('<a></a>');
      link.attr({
        href: window.URL.createObjectURL(blob),
        download: fileName
      });
      link.css('display', 'none');
      $('body').append(link);

      // Click the link to start the download
      link[0].click();

      // Remove the link element after the download
      link.remove();
    });
})
