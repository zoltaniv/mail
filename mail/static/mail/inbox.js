document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //  Submit new email
  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Load mailbox ======================================================================================================
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send GET request to server
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        // Craete div element class row ....................
        const element = document.createElement('div');
        element.id = 'row';
        element.innerHTML = `From: ${email.sender} | Subject: ${email.subject} | Date: ${email.timestamp}`;
        // Check, is the mail readed
        if (email.read === true) {
          element.style.background = 'lightgray';
        }
        // Add eventListener for click
        element.onclick = () => load_email(email.id);

        // Add row element to div id=emails-view
        document.querySelector('#emails-view').append(element);
      })
    })
  .catch(error => {
    console.log(error);
  });
}


// Open email =========================================================================================
function load_email(email_id) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#sender').innerHTML = '';
  document.querySelector('#recipients').innerHTML = '';
  document.querySelector('#subject').innerHTML = '';
  document.querySelector('#timestamp').innerHTML = '';
  document.querySelector('#body').innerHTML = '';
  
  // Send GET request to server ..........................
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Display error
      if(email.error) {
        alert(email.error);
        // Load send folder
        load_mailbox('inbox');
        return false;
      }
      // Create elements
      for (let property in email) {
        if (property == 'id' | property == 'read' | property == 'archived' | property == 'body') {
          continue;
        }
        const element = document.querySelector(`#${property}`);
        element.innerHTML = `${email[property]}`;
      }
      // Create body element
      const element = document.querySelector('#body');
      element.innerHTML = `${email.body}`;
  })
  .catch(error => {
    console.log(error);
  });
}


// Submit new email ===================================================================================
function send_email() {
  // Stop sending the form
  event.preventDefault();
  // Get data for email
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  // Send POST request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Display error
      if(result.error){
        alert(result.error);
        return false;
      }
      // Load send folder
      load_mailbox('sent');
      // Finish submit event
      document.getElementById("compose-form").requestSubmit("submit");

  });
}
