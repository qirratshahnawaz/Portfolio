from agents import function_tool
from sanity_client import query_sanity
import logging

# Set up logging
from logging_config import get_logger
logger = get_logger(__name__)


@function_tool
def get_profile() -> str:
    """Get complete profile information including name, bio, and contact details."""
    logger.info("Executing get_profile tool")
    query = '''
    *[_id == "singleton-profile" && !(_id in path("drafts.**"))][0]{
        firstName,
        lastName,
        headline,
        shortBio,
        email,
        phone,
        location,
        availability,
        yearsOfExperience,
        "profileImageUrl": profileImage.asset->url,
        socialLinks
    }
    '''

    result = query_sanity(query, use_cdn=False)
    # Fallback: if singleton-profile ID fails, try querying by type
    if not result:
        logger.debug("singleton-profile ID query returned nothing, trying by type")
        query_by_type = '*[_type == "profile" && !(_id in path("drafts.**"))][0]'
        result = query_sanity(query_by_type, use_cdn=False)

    logger.debug(f"get_profile raw result: {result}")

    if not result:
        logger.warning("Profile information not available from Sanity")
        return "Profile information not available."

    # Format response
    name = f"{result.get('firstName', '')} {result.get('lastName', '')}".strip()
    response = f"""
Profile Information:
Name: {name}
Headline: {result.get('headline', 'N/A')}
Bio: {result.get('shortBio', 'N/A')}
Location: {result.get('location', 'N/A')}
Experience: {result.get('yearsOfExperience', 0)} years
Availability: {result.get('availability', 'N/A')}
Email: {result.get('email', 'N/A')}
Phone: {result.get('phone', 'N/A')}
    """.strip()

    logger.info("Profile information retrieved from Sanity", extra={"tool": "get_profile"})
    return response


@function_tool
def get_skills(category: str | None = None) -> str:
    """Get skills with proficiency levels, optionally filtered by category.

    Args:
        category: Optional category filter (frontend, backend, devops, ai/ml, database)
    """
    logger.info(f"Executing get_skills tool with category: {category}")
    if category:
        query = f'''
        *[_type == "skill" && category == "{category}" && !(_id in path("drafts.**"))] | order(percentage desc) {{
            name,
            category,
            proficiency,
            percentage,
            yearsOfExperience
        }}
        '''
    else:
        query = '''
        *[_type == "skill" && !(_id in path("drafts.**"))] | order(percentage desc) {
            name,
            category,
            proficiency,
            percentage,
            yearsOfExperience
        }
        '''

    skills = query_sanity(query)
    logger.debug(f"get_skills raw skills: {skills}")

    if not skills:
        logger.warning("No skills found in Sanity")
        return "No skills found."

    # Format response
    result = f"Skills ({len(skills)} total):\n\n"
    for skill in skills:
        result += f"• {skill['name']} ({skill.get('category', 'N/A')}): "
        result += f"{skill.get('proficiency', 'N/A')} ({skill.get('percentage', 0)}%), "
        result += f"{skill.get('yearsOfExperience', 0)} years\n"

    logger.info(f"Skills retrieved from Sanity (count: {len(skills)})", extra={"tool": "get_skills", "category": category})
    return result.strip()


@function_tool
def get_projects(featured_only: bool = False) -> str:
    """Get portfolio projects with descriptions and technologies used.

    Args:
        featured_only: If True, return only featured projects
    """
    logger.info(f"Executing get_projects tool with featured_only: {featured_only}")
    if featured_only:
        query = '''
        *[_type == "project" && featured == true && !(_id in path("drafts.**"))] | order(order asc) {
            title,
            tagline,
            "technologies": technologies[]->name,
            githubUrl,
            liveUrl,
            "imageUrl": coverImage.asset->url
        }
        '''
    else:
        query = '''
        *[_type == "project" && !(_id in path("drafts.**"))] | order(order asc) {
            title,
            tagline,
            "technologies": technologies[]->name,
            githubUrl,
            liveUrl,
            "imageUrl": coverImage.asset->url
        }
        '''

    projects = query_sanity(query)
    logger.debug(f"get_projects raw projects: {projects}")

    if not projects:
        logger.warning("No projects found in Sanity")
        return "No projects found."

    # Format response
    result = f"Projects ({len(projects)} total):\n\n"
    for project in projects:
        result += f"**{project['title']}**\n"
        result += f"{project.get('tagline', 'N/A')}\n"
        result += f"Technologies: {', '.join(project.get('technologies', []))}\n"

        if project.get('githubUrl'):
            result += f"GitHub: {project['githubUrl']}\n"
        if project.get('liveUrl'):
            result += f"Live: {project['liveUrl']}\n"
        result += "\n"

    logger.info(f"Projects retrieved from Sanity (count: {len(projects)})", extra={"tool": "get_projects", "featured_only": featured_only})
    return result.strip()


@function_tool
def search_experience(query_param: str | None = None) -> str:
    """Search work experience by company name or position.

    Args:
        query_param: Search term for company or position
    """
    logger.info(f"Executing search_experience tool with query: {query_param}")
    if query_param:
        groq_query = f'''
        *[_type == "experience" && !(_id in path("drafts.**")) && (
            company match "{query_param}*" ||
            position match "{query_param}*"
        )] | order(startDate desc) {{
            company,
            position,
            startDate,
            endDate,
            current,
            "technologies": technologies[]->name,
            responsibilities,
            achievements
        }}
        '''
    else:
        groq_query = '''
        *[_type == "experience" && !(_id in path("drafts.**"))] | order(startDate desc) {
            company,
            position,
            startDate,
            endDate,
            current,
            "technologies": technologies[]->name,
            responsibilities,
            achievements
        }
        '''

    experience = query_sanity(groq_query)
    logger.debug(f"search_experience raw experience: {experience}")

    if not experience:
        logger.warning("No experience found in Sanity")
        return "No experience found."

    # Format response
    result = f"Work Experience ({len(experience)} positions):\n\n"
    for job in experience:
        end_date = "Present" if job.get('current') else job.get('endDate', 'N/A')
        result += f"**{job['position']} at {job['company']}**\n"
        result += f"{job.get('startDate', 'N/A')} - {end_date}\n"
        
        if job.get('technologies'):
            result += f"Technologies: {', '.join(job['technologies'])}\n"
            
        if job.get('responsibilities'):
            result += "Responsibilities:\n"
            for resp in job['responsibilities']:
                result += f"  • {resp}\n"
                
        if job.get('achievements'):
            result += "Key Achievements:\n"
            for ach in job['achievements']:
                result += f"  • {ach}\n"
        result += "\n"

    logger.info(f"Experience retrieved from Sanity (count: {len(experience)})", extra={"tool": "search_experience", "query": query_param})
    return result.strip()


@function_tool
def check_availability() -> str:
    """Check if available for work, projects, or consultations."""
    logger.info("Executing check_availability tool")
    query = '''
    *[_id == "singleton-profile" || (_type == "profile" && !(_id in path("drafts.**")))][0]{
        availability,
        email,
        "services": *[_type == "service" && !(_id in path("drafts.**"))] | order(order asc){
            title,
            shortDescription,
            pricing
        }
    }
    '''

    result = query_sanity(query)
    logger.debug(f"check_availability raw result: {result}")

    if not result:
        logger.warning("Availability information not available from Sanity")
        return "Availability information not available."

    response = f"Availability Status: {result.get('availability', 'Not specified')}\n\n"

    if result.get('services'):
        response += "Services Offered:\n"
        for service in result['services']:
            pricing = service.get('pricing', {})
            price_str = "Contact for pricing"
            if pricing and pricing.get('startingPrice'):
                price_str = f"From ${pricing['startingPrice']}"
                if pricing.get('priceType'):
                    price_str += f" ({pricing['priceType']})"
            
            response += f"• {service['title']}: {price_str}\n"
            if service.get('shortDescription'):
                response += f"  {service['shortDescription']}\n"

    response += f"\nContact: {result.get('email', 'N/A')}"

    logger.info("Availability information retrieved from Sanity", extra={"tool": "check_availability"})
    return response.strip()