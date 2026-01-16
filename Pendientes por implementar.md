FLY-ZULU





home personalizada de acuerdo al puesto o rol de cada usuario:



&nbsp;**AIR: (Debe de ser con capacidad OOFLINE SI O SI)**



Pilot= 

Home Pilot Page:

-Cards de direcionamiento :

* Salidas=  Te direcciona a la pagina exlcusiva para Salidas (Tablero de Salidas Colaborativo)  ( ésta pagina es la única que se comparte con todos los usuarios, independientemente de su rol o puesto: debe de tener un texto que invite al usuario a participar agregando vuelos , ya sea para editar, actualizar status (esto ya debe de estar en la información), 
* Flight (antes llamado Work): aquí debe de venir una pagina con un  mcdu para calculo de horas de vuelo (ya existe, solamente debe de confirmarse que el formato es 24hrs HH:MM ya que es hora zulu)), en la parte de hasta arriba de la página se debe de tener un apartado para calculo de horas de jornada (las jornadas pueden abarcar 2 días , es decir, son horarios mixtos, y se calculan utilizando la hora zulu siempre, ejemplo: hoy enero 2 inicié jornada hora zulu 18:00 Z y terminé 03:00 Z, el sistema debe de saber que se tomará el calculo del dia siguiente que es 03:00 Zulu menos el inicio de jornada 18:00 del dia anterior, esta debe de ser la logica del sistema, nunca se podrá tener resulatados en negativo porque el tiempo no va hacia atrás, el tiempo corre hacia adelante y en horas zulu tambien, ésto es ley debe de ser así el trabajo. por lo que en ésta pagina siempre aparecerá la Hora Zulu en Hard , y un search para buscar el aeropuerto de salida y salga su horario local , solamente como referencia hacia el usuario.  Quiero que de una vez tener la estructura que el inicio de jornada será automatico o de no existir datos obtenidos por el sistema de otra feature, el usuario intuya que debe de ingresar sus datos para el calculo de jornada. En la página de Flight está el MCDU digital (ya existe, sólo quiero que se confirme que el calculo de horas debe de ser para FLIGHT : ( ON - OFF ) para BLOCK : ( IN - OUT ) , cuando el usuario agrega datos, éstos mismos no se podrán borrar si no hasta que el usuario agregue otro vuelo o en su defecto presione un boton que diga fin vuelo (crearlo porque éste no existe), hasta éste momento lso datos se irán a una base de datos para utilizarse en historico del usuario, cuando el usuario agrega otro vuelo , en automatico los datos del vuelo pasado se guardan en tipo "hard" para evitar ser borrrados, eliminados, editados por descuido. Cuando el sistema recibe el input de resultado de calculo de horas de vuelo, para asegurar que ya terminó deberá alir un mensaje en donce dice: Agregar otro vuelo o Fin de Día, asi es como el sistema sabe que el usuario quiere agregar otro vuelo y aparecerá otro mcdu digital listo para agregar los datos del nuevo vuelo. Para la secciond de Jornada, el calulo será de al momento de recibir el dato IN , le sumará de inmediato 00:30 (treinta minutos ) que serán editables, ésta suma de 30 minutos ddespues del IN es cuando se termina la jornada (recuerda que puede existir jornada mixta, por ejemplo IN : 23:50, la suma de 00:30 será para la jornada 00:20 Zulu (hora del siguiente dia), ésta lógica aplica para todos los horarios de horas de vuelo y jornada (ejemplo OUT: 23:55 IN: 02:30 siginifica que el bloque de horas es 02:35 , ésta regla siempre se debe de aplicar, "el horario se utiliza es zulu, puede exitir horarios mixtos que cubran al dia siguiente para el calculo de jornada como horas de vuelo)  En jornada de vueo puede iniciar en un horario anterior al horario actual en zulu, yo creo que para mejor ayudar al usuario a que su calculo sea correcto, en el inicio de jornada al escribirlo, debe de salir un mensaje de por ejemplo el usuario escribe en el apartado de inicio de jornada :  23:50 y en ese momento la hora actual es 00:30 por ejemplo, el sistema debe saber que el usaurio se refiere a que inició su jornada segun el horario zulu el dia anterior, por lo que debe de aparecer un mensaje tipo : tu itinerario es a las 00:50 ? es decir el incio de jornada empieza 1:00 (una hora antes de su vuelo, asi que si es asi y te confirma que su vuelo itinerario es a esa hora,el inicio de jornada es correcto. Los itinerarios de vuelo son en horario local exclusivamente ) 





FA :

&nbsp;  Home FA Page:

* Salidas 
* CABIN



**GND:**

Ops :

Home Page :

* Salidas
* Operacion

Traffico

Home Page:

* Salidas 
* Operación



Mantto:

Home Page:

* Salidas
* Operacio 





Admin Panel : (exclusivo para el admin y suoeradmin)

