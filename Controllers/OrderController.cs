using Microsoft.AspNetCore.Mvc;
using WebAppOrder.Controllers;

namespace InspiroOrderWebApps.Controllers
{
    public class OrderController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public OrderController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}
