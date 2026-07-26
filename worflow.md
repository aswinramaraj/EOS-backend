i will explain the workflow in detail below

{--------------------------------------------------------------------------------------
Admin :

RBAC with admin can perform below :

now admin creates dapartments, courses, batches, department wise classes in each batch (ex : BATCH 2022 - 2026 , AI & DS - A )

admin creates faculties with thier designation and personal informations required for the college inclusing aadhar number,pan card number ,account details and maps the faculty to a respective department needed

now admin creates the Sale of Application(SOA) where they collect the basic details of the student like first name ,last name, parents details ,contact details of parents and student ,cutoff details(phys.chem,maths marks),student whatsapp number and email, community details

once the student has paid the fees and confirmed the admission then Perfect entry is done that has a very detailed collection of details like First Graduate / 7.5 reservation / sports -qouta and mutiple details like aadhar, pan, day scholar or hosteller ,if day scholar (own transport or College TRansport) if own transport collect vehicle number if college transport ,selct the boarding point and destination point ,this perfect entry is done by the student itself in the web application

Now admin maps the student to the respective class created.

admin creates a list of subjects along with thier course code

admin Create a list of demands like :
government quota :
tuition fees : xxxx
special fee : xxx
development fee : xxx

government quota with First Graduate certificate :
tuition fees : xxxx
special fee : xxx
development fee : xxx
Concession : 25,000

in this ,the concession amount will not be considered initially ,once the goverment settles the concession amount to the college ,the concession amount is applied and the fees gets reduced

7.5 reservation :
no fees for them

Managemet quota :
different fee structure

demands for hostel
4 sharing - xxxx
3 sharing - xxxx
2 sharing - xxxx
4 sharing with attached restrooms - xxxx
3 sharing with attached restrooms - xxxx

demands for transport based on the transport route and stages:

list of routes and thier stages are created by the admin , based on the stage ,the fee to be paid is calculated automatically or can be manually configured

admin can view the Purchase Order Proposal and create the Purchase order -> the purchase order is created by the below process :{
Admin has the list of vendors along with thier quotation, now admin chooses the best vendor and has a page where the indents can be downloaded as a template with college letter pad ,then admin proceeds the Purchase order manually through the management
admin can view the Service order proposal and chooses the best service vendor and the Service order can be downloaded as a template with college letter pad,then admin proceeds the Service Order manually through management

once the Purchase order or Service order is approved by the management ,the PO and SO is send to the vendor, money is handled by the Finance Team

GRN : once the items are recieved from the vendor ,the list of quantity is added and if taken ,its issued along with with the venue its being used


post announcements for parents by selecting specific batch ,year ,departmtne in a seperate window

post announcements for teachers in a seperate window

post announcements for students selecting specific batch ,year ,departmtne in a seperate window
}

}

{--------------------------------------------------------------------------------------
HoD :

RBAC with HoD can do the below :

HoD assigns the class with a respective faculty as Mentor ,the entire class students are mapped to the faculty
HoD assigns subjects to each faculty , a faculty can be assigned with mutiple subject and can be assigned to mutiple class of different batches
now hod creates the timetable by selecting the courses applicable for the class and maps the faculty to the class who was assigned to the subject(2 faculties might have been assigned to same subject where they will assigned to different classes by the HoD)
HoD checks and approves the Created Purchase Order Proposal or Service Order Proposal and it can be viewed by the admin
HoD reviews the appraisal request from the faculty
can apply for reservation of a Venue from the college ,they can view the available venues and booked venues ,if booked ,show details of who booked and purpose and accomadating strength
hod must approve students leave that is approved from faculty mapped to the student
hod must approve leave request of faculty that is redirected to HR department
must approve OD from student


}

{--------------------------------------------------------------------------------------
students :

RBAC with student can perform below :

students can view thier daily timetable and week timetable
students can view the grades of thier exams (CIA and University exam)
download marksheets of the Univerisity exams
request bonafile certificate by selecting list of valid reasons created by the admin
view attendance
view daily lesson plan
apply leave and view the status
apply for On-duty and view the status(two options(create team and join team). create team: any one student creates a team and their team member joins using the unique code that is generated while creating a team. if the student is from the various dept the approval of the OD must go to the respective dept's HoD of the student. Once approved the team shall not allow any new member to add team , but can remove. for the approval the approach is student requsts the mentor, once mentor approes it goes to HoD )
view the LMS created by faculties
view and pay fees and download receipts
view library resources and books taken from library
if hostller ,can view details of the hostel room number and their Demand(fees to be paid like 4 sharing ,2 sharing , 4 sharing with attahced restroom etc..)
if dayscolar and use college transport ,can view tbe transport details and live tracking of the bus
view announcements posted by the faculty mentor and subject faculties assigned to the respective class
fill feedback forms created by the respective academic co-ordinator
view hall plan and seating arrangements created by the COE(Centre of Examination)
view the IN and OUT entr
ies made from Hostel if Hosteller
view notifications
download hall ticket with predefined template
can view profile that contains thier resume ,thier projects , linkedin ,github ,leetcode ,hackerrank ,codefores etc..
a history of placement is stored and can be viewed by the student that has informations like list of companies attended and the status of the drive like R1 cleared , R2 cleared , R3 rejected
hostel students can apply for outing (starting time , returning time, reason, from date, to date)

students must have a section for No-due clearance,they must be able to see it like a grid system with all thier mapped subjects and section that shows the assignment submission status that is marked by the respective faculty

}

{--------------------------------------------------------------------------------------
faculties :

RBAC with faculty can perform below :

view todays classes
mark attendance of the mapped class
update lesson plan for the entire semester(updatable)
mark entry for the exams created by the COE (CIA 1 ,CIA 2, CIA 3 , LABORATORY ETC...)
provide Leave approval of students and triggering it to HoD dashboard
Created notes in the LMS that is created automatically when the faculty is mapped to a subject of the respective class
Post announcements of thier respective class and subject allocated class
view announcements from HoD or Admin Or Academic co-ordinators
Applying leave that is reviewed by HoD and HR department
Generate certain reports like student information with name ,parents name ,number ,parents number ,mail id(official and unofficial) ,aadhar details and pan card details
Apply for appraisal by filling certain details like thier academic performace that has details of subjects handling ,then project developed by students under the mentorship of the faculty, then online courses done by the faculty, paper publications done by the faculty ->appraisal is a score based thing ,HR department creates score for each entry and maximum score for each division like academic, project, online courses, paper publications
faculties can apply for reservation of a Venue from the college ,they can view the available venues and booked venues ,if booked ,show details of who booked and purpose and accomadating strength
view notifications
can view students profile that contains thier resume ,thier projects , linkedin ,github ,leetcode ,hackerrank ,codefores etc.. mapped as mentor to the faculty
a history of placement is stored and can be viewed by the student that has informations like list of companies attended and the status of the drive like R1 cleared , R2 cleared , R3 rejected ->only if mentor of the student

faculties must have a section called no due clearance and faculty clicks any one of the mapped classes ,now the list of students will be displayed along with a tick box for three assignments and the faculty must be able to tick it manually

}

{--------------------------------------------------------------------------------------

COE :

RBAC with COE can perform below :

create exams for various batches CIA 1 ,CIA 2, CIA 3 , LABORATORY Univerisity end semester exam ETC...when creating exam for a batch ,automatically different departments must get thier courses mapped automatically
ex: batch 2022 - 2026 -
    Department : AI-DS
    class : A
    {
     course code : subject name
     course code : subject name
     course code : subject name
     course code : subject name
    } -> this must get mapped automatically to exam creation
create a exam timetable with time based schedule and publish it so the respective batches can view it
create the hall plan and seating arrangements so that students can view it in thier login
assign faculties for Invligilation duty
student re evaluation management for university end semester exam
result publication for Univerisity end semester exam
result publication for reevlation papers - Univerisity end semester exam
}


{--------------------------------------------------------------------------------------

placement cell :

RBAC with placement can perform below :

Create list of companies with thier profile information
store and map the students who got placed in the company
reports of the placement for each batch with respective of each department
view students profile that contains thier resume ,thier projects , linkedin ,github ,leetcode ,hackerrank ,codefores etc..
create a drive with and without discolosing the company name scheduled to a particular date
the un discolsed company name will be disclosed by a day or two day earlier of the scheduled undisclosed drive
notification is triggered to all students in the announcements the day before the drive
a history of placement is stored and can be viewed by the student that has informations like list of companies attended and the status of the drive like R1 cleared , R2 cleared , R3 rejected
can apply for reservation of a Venue from the college ,they can view the available venues and booked venues ,if booked ,show details of who booked and purpose and accomadating strength
placement faculty can enter the details


}

{--------------------------------------------------------------------------------------
Library :

RBAC with library can perform below

create book category like physics ,maths , computer related ,programming langauages
create list of books by scanning the QR code and assigning tbe book details manually and map it to the respective category manually
when students gets a book ,map the book id with the student to denote he has borrowed it ,in the student login ,he must see the details of the borrowed books - same when faculty borrows a book
trigger notification 3 days prior to renew the book or return it within the 1 month deadline
Manage e -resources
view overall list of books and statistics of borrowed books

}


{--------------------------------------------------------------------------------------
Billing section :


now the people with RBAC of billing section can perform the below :

map the students with the created demands
fee collection and reciept generation
partial payment handling
education loan DD handling with status update and provide a acknowledgement receipt of recieving the DD with DD reference number and bank details(template gets updated based on the info given in the form while entering a new DD into the page)
view the overall and individual fees pending with filters like department ,class and roll number

}

{--------------------------------------------------------------------------------------
HR and Payroll Management :

Leave approval of faculties if Hod approved

vacation holiday mapping for faculties that allows the faculties to choose slots
salary divisions like HPA.PF and others are managed here
Pay slip request can be done by faculty and its processed through HR Department
faculty appraisal section : once HoD approves a Appraisal request from a faculty, it come to HR department
HR department creates and configures score for each entry and maximum score for each division like academic, project, online courses, paper publications
HR department reviews the appraisal request and manually proceeds with approval from the management


}

{
Media Room :

Faculties can request Poster designs and required media related things ,if request is approved ,the media is shared to the faculty through the request window itself

}

{--------------------------------------------------------------------------------------
Department seceratary:

RBAC with seceratary and IT infrastructure can do the below :

Create Purchase Order Proposal by creating indent by specifying the product required (16GB RAMs, CPU x 10Nos., SSD, Monitor, Printer etc..) along with its quantity and purpose
many indents can be created by them
Service order proposal can also be created by specifying the services like ( AC repair, Glass Door repair etc...)

these created Purchase order proposal or Service order Proposal is reviewed by the Budget co-cordinators ( Finance Team) and send it to the HoD for Approval

attendance bulk editing for the mapped department
}

{--------------------------------------------------------------------------------------
Finance Team :

RBAC with Finance can perform below :

they manage the overall expenses ,salary credition of employees (faculties, House Keeping etc..)
approves the Purchase Order Proposal or Service Order proposal and it reaches the HoD dashbaord

}

{--------------------------------------------------------------------------------------
IQAC :

RBAC with IQAC can perform below :

view informations of On-Duty of students
view paper publication details of the students
Manage Venue bookings and reservation of venue for events
venue reservation is reviewed by the IQAC and then approval is granted or IQAC provides alternative venues available or denotes no venue availablity


}


{--------------------------------------------------------------------------------------
In/Out Ledger:

RBAC with Main gate and Warden can access below :

when Watch mam from Main gate scans the ID card of student also enter the roll number of the student, the IN entry or Out Entry triggers and sends a SMS to the parents and the student
when warden from hostel approes the request for outing from student, the IN entry to the Hostel or Out Entry from the Hostel triggers and sends a SMS to the parents and the student
for visitors- when new visitor enters the college for any purposes - they collect (vehicle number(if applicable), count of members, reason,phone number)
}

{--------------------------------------------------------------------------------------
Parent :

RBAC with parent can perform below :

view attendance of thier son/daughter
view fees and pay fees
view placement things like upcoming drives and history of thier son/daughter's placement
view exam results of thier son/daughter
view faculty mentor details of thier son/daughter
view announcements posted from admin that are posted in target of parents

}

{--------------------------------------------------------------------------------------
Academic co-odinator:

creates the academic calender for each batch of students for each semester -> based on this admin can select the semester period ,also attendance can calculate the from date.end date ,total working days by excluding the leaves ,weekends by refering the created academic calender

creates feedbacks for the student

maps the batch , department , class with thier own respective list of courses and course code created by the admin

}









