$( document ).ready(function() {
    $('#login1').on('click',function(){
      if($('#email').val() == '' || $('#password').val() == ''){
        alert('Empty fields')
      }else{
        $.ajax({
            url:'http://localhost:3030/login',
            data:{
              email:$('#email').val(),
              password:$('#password').val()
            },
            success:function(res){
              let result = JSON.parse(res)
              if(result.success == 'yes') {
                  location.href = 'http://localhost:3030/shop'
              }
              if(result.failed) {
                alert('email or password incorrect')
              }
            }
        })
    }
  })

  $('input').on('keyup',function(event){
      if(event.key  === "Enter") {
        $('#login1').trigger("click")
      }
  })

  $('.about').on('click',function(){
    $('.cardlogin').toggleClass('is-flipped')
  })

  $.ajax({
      url:'http://localhost:3030/about',
      success:function(res){
          var stats = JSON.parse(res)
          console.log(stats.orders)
          $('.basisabout').append(`<p class="blue">There are currently ${stats.products} food items in the store.</p><p class="blue">There are ${stats.orders} delivery orders currently.<br>Be our next one!</p>`)
      }
  })

})
