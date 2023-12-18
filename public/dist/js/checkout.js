$( document ).ready(function() {
    $.ajax({
      url:'http://localhost:3030/getcart',
      success:function(res){
          let cartproducts = res
          let total = 0
          $.each(cartproducts,(index,product)=>{
            total += product.price  
          })

          $('#total-checkout').text('$' + total.toFixed(2))
      }
  })

  $('input').on('dblclick',function(){
      $.ajax({
          url:'http://localhost:3030/getdetails',
          success:function(res){
              $('#typeCity').val(res[0].city) 
              $('#typeStreet').val(res[0].street) 
              $('#typeFirst').val(res[0].first) 
              $('#typeLast').val(res[0].last) 
          }
      })
  })

  $('#btn-checkout').on('click',function(){
      if($('#typeFirst').val() == ''){
        alert('Type your first name')
      }else if($('#typeLast').val() == ''){
        alert('Type last name')
      }else if($('#typeCity').val() == ''){
        alert('Type city')
      }else if($('#typeStreet').val() == ''){
        alert('Type street')
      }else if($('#datepicker').val() == ''){
        alert('Type date')
      }else if($('#card').val() == ''){
        alert('Type card number')
      }else{
        let payment = $('#payment').serializeArray()
        $.ajax({
            url:'http://localhost:3030/payment',
            data:{fields:payment},
            success:function(res){
                let result = JSON.parse(res)
                if(result.order == "succed"){
                    location.href = "/receipt"
                }else if(result.products == "none"){
                    location.href = "/shop"
                }
            }
        })
      }
  })
})


