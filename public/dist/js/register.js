$( document ).ready(function() {
  
  $('#register-btn1').on('click',function(){
    if($('#Id').val() == '' || $('#Email').val() == '' || $('#Password').val() == '' || $('#Repassword').val() == ''){
      alert('Empty fields')
    }else{
      $.ajax({
          url:'http://localhost:3030/register1',
          data:{fields:$('#register1').serializeArray()},
          success:function(res){
            var result1 = JSON.parse(res)
  
            if(result1.success == "yes"){
              $('#register1').hide()
              $('#register2').show()
            }
            if(result1.id){
                $('#idErr').show()
            }else{
              $('#idErr').hide()
            }
  
            if(result1.email){
                $('#emailErr').show()
            }else{
                $('#emailErr').hide()
            }
          }
  
      })
    }
})

$('#register1 input').on('keyup',function(event){
  if(event.key  === "Enter") {
    $('#register-btn1').trigger("click")
  }
})

$('#register-btn2').on('click',function(){
  if($('#city').val() == '' || $('#street').val() == '' || $('#first').val() == '' || $('#last').val() == ''){
    alert('Empty fields')
  }else{
    $.ajax({
        url:'http://localhost:3030/register2',
        data:{
          city:$('#city').val(),
          street:$('#street').val(),
          first:$('#first').val(),
          last:$('#last').val()
        },
        success:function(res){
          var result2 = JSON.parse(res)
          if(result2.success == "yes"){
            $('#register2').hide()
            $('#register3').show()
          }
        }
    })
  }
})

$('#register2 input').on('keyup',function(event){
  if(event.key  === "Enter") {
    $('#register-btn2').trigger("click")
  }
})


$('#register-btn3').on('click',function(){
    $.ajax({
        url:'http://localhost:3030/register3',
        data:{code:$('#code').val()},
        success:function(res){
        location.href = '/login';
        }
    })
})

$('#register3 input').on('keyup',function(event){
  if(event.key  === "Enter") {
    $('#register-btn3').trigger("click")
  }
})

})
