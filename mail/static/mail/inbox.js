document.addEventListener("DOMContentLoaded", function () {

  // Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => {
    // Show the mailbox name
    document.querySelector("#emails-view").innerHTML = "<h3>Inbox</h3>";
    // Start always with first email
    counter = 0;
    load_mailbox("inbox");
  });
  document.querySelector("#sent").addEventListener("click", () => {
    // Show the mailbox name
    document.querySelector("#emails-view").innerHTML = "<h3>Sent</h3>";
    // Start always with first email
    counter = 0;
    load_mailbox("sent");
  });
  document.querySelector("#archived").addEventListener("click", () => {
    // Show the mailbox name
    document.querySelector("#emails-view").innerHTML = "<h3>Archived</h3>";
    // Start always with first email
    counter = 0;
    load_mailbox("archive");
  });
  document.querySelector("#compose").addEventListener("click", compose_email);
  //  Submit new email
  document.querySelector("#compose-form").addEventListener("submit", send_email);

  // By default, load the inbox by click event
  document.querySelector("#inbox").click();
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}


function compose_emailResponse(recipient, subject, body) {

  // Show compose view and hide other views
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = `${recipient}`;
  document.querySelector("#compose-subject").value = `${subject}`;
  document.querySelector("#compose-body").value = `${body}`;
}


// Load mailbox ======================================================================================================
// Start with first email
var counter = 0;
// Load emails 20 at a time
const quantity = 20;
function load_mailbox(mailbox) {

  // Set start and end emails numbers, and update counter
  const start = counter;
  const end = start + quantity - 1;
  counter = end + 1;

  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#emails-view").dataset.mailbox = `${mailbox}`;
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";

  // Send GET request to server
  fetch(`/emails/${mailbox}?start=${start}&end=${end}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        // Craete div element class row ....................
        const element = document.createElement("div");
        element.className = "row";

        // Create div elements for From, Subject and Date fields
        // and add the innerHTML content
        const fromElement = document.createElement("div");
        fromElement.className = "from";
        fromElement.innerHTML = `From: ${email.sender}`;
        const subjectElement = document.createElement("div");
        subjectElement.className = "subject";
        const subject = email.subject.slice(0, 30);
        subjectElement.innerHTML = `Subject: ${subject}`;
        const dateElement = document.createElement("div");
        dateElement.className = "date";
        dateElement.innerHTML = `Date: ${email.timestamp}`;

        // Add the above items to the element of the row class
        element.append(fromElement);
        element.append(subjectElement);
        element.append(dateElement);

        // Check, is the mail readed
        if (email.read === true) element.style.background = "lightgray";

        // Add eventListeners
        element.onclick = () => load_email(email.id);

        // Create archive button
        if (mailbox == "inbox") {
          const archiveButton = document.createElement("button");
          archiveButton.type = "submit";
          archiveButton.innerHTML = "Archive";
          archiveButton.className = "archive";
          archiveButton.onclick = (event) => {
            // Stop propagation event click
            event.stopPropagation();
            // Mark email as archived
            fetch(`/emails/${email.id}`, {
              method: "PUT",
              body: JSON.stringify({
                archived: true,
              }),
            })
              .then((response) => {
                // Remove mail element
                if (response.ok) {
                  archiveButton.parentElement.style.animationPlayState =
                    "running";
                  archiveButton.parentElement.addEventListener(
                    "animationend",
                    () => {
                      archiveButton.parentElement.remove();
                    }
                  );
                }
              })
              .catch((error) => {
                console.log(error);
              });
          };
          // Add the button to div element
          element.append(archiveButton);
        }

        // Create dearchive button
        if (mailbox == "archive") {
          const dearchiveButton = document.createElement("button");
          dearchiveButton.type = "submit";
          dearchiveButton.innerHTML = "Dearchive";
          dearchiveButton.className = "dearchive";
          dearchiveButton.onclick = (event) => {
            // Stop propagation event click
            event.stopPropagation();
            // Mark email as archived
            fetch(`/emails/${email.id}`, {
              method: "PUT",
              body: JSON.stringify({
                archived: false,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  dearchiveButton.parentElement.style.animationPlayState =
                    "running";
                  dearchiveButton.parentElement.addEventListener(
                    "animationend",
                    () => {
                      dearchiveButton.parentElement.remove();
                    }
                  );
                }
              })
              .catch((error) => {
                console.log(error);
              });
          };
          // Add the button to div element
          element.append(dearchiveButton);
        }

        // Add row element to div id=emails-view
        document.querySelector("#emails-view").append(element);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

// Open email =========================================================================================
function load_email(email_id) {
  // Mark email as readed
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });

  // Show the email and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#sender").innerHTML = "";
  document.querySelector("#recipients").innerHTML = "";
  document.querySelector("#subject").innerHTML = "";
  document.querySelector("#timestamp").innerHTML = "";
  document.querySelector("#body").innerHTML = "";

  // Send GET request to server ..........................
  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      // Display error
      if (email.error) {
        alert(email.error);
        // Load send folder
        load_mailbox("inbox");
        return false;
      }
      // Create elements
      for (let property in email) {
        if (
          (property == "id") |
          (property == "read") |
          (property == "archived") |
          (property == "body")
        )
          continue;
        const element = document.querySelector(`#${property}`);
        element.innerHTML = `${email[property]}`;
      }
      // Create body element
      const element = document.querySelector("#body");
      element.innerHTML = `${email.body}`;

      // Get arguments for compose_emailResponse fuction
      var recipient = email.sender;
      var subject = "";
      if (email.subject.substr(0, 3) !== "Re:") {
        subject = `Re: ${email.subject}`;
      } else {
        subject = email.subject;
      }
      var body = `On ${email.timestamp} ${email.sender} has written:`;
      document.querySelector("#response").onclick = () =>
        compose_emailResponse(recipient, subject, body);
    })
    .catch((error) => {
      console.log(error);
    });
}

// Submit new email ===================================================================================
function send_email() {
  // Stop sending the form
  event.preventDefault();
  // Get data for email
  var recipients = document.querySelector("#compose-recipients").value;
  var subject = document.querySelector("#compose-subject").value;
  var body = document.querySelector("#compose-body").value;
  // Send POST request
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Display error
      if (result.error) {
        alert(result.error);
        return false;
      }
      // Load the sent box by click event
      document.querySelector("#sent").click();
    });
}


// Create scroll listener
window.onscroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    if (document.querySelector("#emails-view").style.display == "block") {
      load_mailbox(`${document.querySelector("#emails-view").dataset.mailbox}`);
    }
  }
};
