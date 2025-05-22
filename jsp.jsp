<html>
<head><title>?</title>
</head>
<body>
<%
String d=request.getParameter("t1");
int i=0,n=-1;
String[] name={"Barath","Thinesh","Bagavathi","Indira"};
String[] defn={"Computer Student","Biotechnology Student","Civil Engineer","Homemaker"};
for(i=0;i<4;i++)
{
if(d.equals(name[i]))
{
n=i;
}
}
if(n!=-1)
out.println(defn[n]);
%>
</body>