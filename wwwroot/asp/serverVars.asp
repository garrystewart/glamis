<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="/system/css/bootstrap4.min.css">
	<link rel="stylesheet" href="/system/css/font-awesome.min.css">
  </head>
  <body>
    <div class="container-fluid">
        <div class="row">
            <div class="col-xs-12">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Variable Name</th>
                            <th>Variable Content</th>
                        </tr>
                    </thead>
                    <tbody>
                        <%
                        For Each x In Request.ServerVariables

                          Response.Write("<tr><td>" & x & "</td><td>" & Request(x) & "</td></tr>")

                        Next
                        %>
                    </tbody>
                </table>  
            </div>
        </div>    
    </div>
    <!-- jQuery first, then Tether, then Bootstrap JS. -->
    <script src="/system/js/jquery-3.1.1.min.js"></script>
    <script src="/system/js/tether.min.js"></script>
    <script src="/system/js/bootstrap4.min.js"></script>
  </body>
</html>